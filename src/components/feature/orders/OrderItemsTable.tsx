'use client';

import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { OrderItem } from '@/type/order';

interface OrderItemsTableProps {
  orderItems: OrderItem[];
  onDeleteItem: (itemId: string, itemsToDelete?: string[]) => Promise<void> | void;
  onUpdatePaymentStatus?: (userId: string, isPaid: boolean, amount: number) => void; // 新增付款狀態更新函數
  emptyStateMessage?: string;
  className?: string;
  readOnly?: boolean;
  isOrderCreator?: boolean; // 添加是否為訂單創建者的屬性
  isSubmitted?: boolean; // 添加訂單是否已提交的屬性
  disablePaymentTab?: boolean; // 是否禁用收款頁籤
}

// 使用者訂購資訊的介面
interface UserOrderInfo {
  userName: string; // 訂購人名稱
  quantity: number; // 訂購數量
  originalId: string; // 原始訂單 ID
}

interface ConsolidatedOrderItem extends Omit<OrderItem, 'id' | 'userId' | 'userName'> {
  id: string; // 合併後的項目 ID
  originalIds: string[]; // 原始項目 ID 列表，用於刪除操作
  userNames: string[]; // 訂購人列表
  userCount: number; // 訂購人數量
  userOrders: UserOrderInfo[]; // 每位使用者的訂購詳情
}

// 付款視圖中的訂單項目介面
interface PaymentViewItem {
  userId: string;
  userName: string;
  isPaid: boolean;
  total: number;
  orderDetails: {
    menuItemName: string;
    quantity: number;
    subtotal: number;
    notes?: string;
  }[];
}

/**
 * 訂單項目表格元件
 * 用於顯示訂單的詳細項目，包含商品名稱、價格、數量等資訊
 * 相同品名和相同備註的訂單會被合併顯示
 */
const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  orderItems,
  onDeleteItem,
  onUpdatePaymentStatus,
  emptyStateMessage = "目前沒有訂單項目",
  className = "",
  readOnly = false,
  isOrderCreator = false, // 默認非創建者
  isSubmitted = false, // 默認訂單未提交
  disablePaymentTab = true, // 默認禁用收款頁籤
}) => {
  // 新增提示顯示狀態
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  
  // 使用 ref 取得頁籤元素
  const paymentTabRef = React.useRef<HTMLButtonElement>(null);
  
  // 記錄收款頁籤的位置
  const [tabPosition, setTabPosition] = useState({ top: 0, left: 0 });

  // 更新頁籤位置的函數
  const updateTabPosition = () => {
    if (paymentTabRef.current) {
      const rect = paymentTabRef.current.getBoundingClientRect();
      setTabPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX
      });
    }
  };
  
  // 當提示顯示狀態變更時更新頁籤位置
  useEffect(() => {
    if (showTooltip) {
      updateTabPosition();
    }
  }, [showTooltip]);

  // 創建提示 Portal - 即時顯示提示訊息在頁籤右側
  const tooltipPortal = showTooltip && disablePaymentTab && !isSubmitted ? (
    ReactDOM.createPortal(
      <div 
        className="fixed z-[99999] bg-gray-600 bg-opacity-80 text-gray-200 px-3 py-1 rounded shadow-sm pointer-events-none text-xs whitespace-nowrap opacity-100 transition-none"
        style={{
          top: `${tabPosition.top + 5}px`,
          left: `${tabPosition.left + 10}px`
        }}
      >
        點擊右下角「確認訂單」按鈕，開啟收款功能
      </div>,
      document.body
    )
  ) : null;

  // 新增頁籤狀態
  const [activeTab, setActiveTab] = useState<'order' | 'payment'>(isSubmitted ? 'payment' : 'order');
  
  // 當訂單狀態變更時，更新頁籤狀態
  useEffect(() => {
    if (isSubmitted) {
      setActiveTab('payment');
    }
  }, [isSubmitted]);
  
  // 新增付款狀態的內部狀態管理，使用者點擊後可立即看到效果
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>({});

  // 初始化付款狀態由orderItems的內容填充
  useEffect(() => {
    const statusMap: Record<string, boolean> = {};
    orderItems.forEach(item => {
      if (!statusMap[item.userId]) {
        statusMap[item.userId] = item.isPaid || false;
      }
    });
    setPaymentStatus(statusMap);
  }, [orderItems]);

  // 合併相同品名和相同備註的訂單項目
  const consolidatedItems = useMemo(() => {
    const itemMap = new Map<string, ConsolidatedOrderItem>();
    
    orderItems.forEach(item => {
      // 創建用於合併的鍵值（品名+備註）
      const key = `${item.menuItemName}|${item.notes || ''}`;
      
      // 創建用戶訂購資訊
      const userOrderInfo: UserOrderInfo = {
        userName: item.userName,
        quantity: item.quantity,
        originalId: item.id
      };
      
      if (itemMap.has(key)) {
        // 如果已有相同項目，則更新數量和小計
        const existingItem = itemMap.get(key)!;
        existingItem.quantity += item.quantity;
        existingItem.subtotal += item.subtotal;
        existingItem.originalIds.push(item.id);
        existingItem.userOrders.push(userOrderInfo);
        
        // 如果是不同的用戶，則添加到用戶列表
        if (!existingItem.userNames.includes(item.userName)) {
          existingItem.userNames.push(item.userName);
          existingItem.userCount += 1;
        }
      } else {
        // 創建新的合併項目
        itemMap.set(key, {
          ...item,
          originalIds: [item.id],
          userNames: [item.userName],
          userCount: 1,
          userOrders: [userOrderInfo]
        });
      }
    });
    
    return Array.from(itemMap.values());
  }, [orderItems]);
  
  // 規範化後的付款視圖數據，使用本地狀態
  const paymentViewItems = useMemo(() => {
    const userMap = new Map<string, PaymentViewItem>();
    
    orderItems.forEach(item => {
      if (!userMap.has(item.userId)) {
        // 為每個用戶創建新條目
        userMap.set(item.userId, {
          userId: item.userId,
          userName: item.userName,
          isPaid: paymentStatus[item.userId] ?? false, // 使用本地付款狀態
          total: 0,
          orderDetails: []
        });
      }
      
      const userItem = userMap.get(item.userId)!;
      
      // 更新總金額
      userItem.total += item.subtotal;
      
      // 添加訂單詳情
      userItem.orderDetails.push({
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        subtotal: item.subtotal,
        notes: item.notes
      });
    });
    
    return Array.from(userMap.values());
  }, [orderItems, paymentStatus]);
  
  // 計算已收款和待收款金額
  const paymentSummary = useMemo(() => {
    let collected = 0;
    let pending = 0;
    
    paymentViewItems.forEach(item => {
      if (item.isPaid) {
        collected += item.total;
      } else {
        pending += item.total;
      }
    });
    
    return { collected, pending, total: collected + pending };
  }, [paymentViewItems]);

  // 計算總金額
  const calculateTotal = (): number => {
    return consolidatedItems.reduce((total, item) => total + item.subtotal, 0);
  };

  // 處理刪除項目
  const handleDeleteItem = async (item: ConsolidatedOrderItem) => {
    try {
      console.log('訂單創建者狀態:', isOrderCreator);
      console.log('要刪除的項目 IDs:', item.originalIds);

      // 如果是訂單創建者，一次刪除全部相同品名項目
      if (isOrderCreator && item.originalIds.length > 0) {
        // 使用第一個 ID 作為基礎 ID，並將其餘項目作為批量刪除列表
        await onDeleteItem(item.originalIds[0], item.originalIds);
        return;
      }
      
      // 非訂單創建者只能刪除自己的項目
      if (item.originalIds.length === 1) {
        await onDeleteItem(item.originalIds[0]);
      }
    } catch (error) {
      console.error('刪除項目時發生錯誤:', error);
    }
  };
  
  // 處理付款狀態更新
  const handlePaymentStatusChange = (userId: string, isPaid: boolean, amount: number) => {
    // 更新本地狀態，立即反映在界面上
    setPaymentStatus(prev => ({
      ...prev,
      [userId]: isPaid
    }));
    
    // 調用外部回調函數，通知父組件更新資料
    if (onUpdatePaymentStatus) {
      onUpdatePaymentStatus(userId, isPaid, amount);
    }
  };

  // 格式化用戶名稱顯示
  const formatUserDisplay = (item: ConsolidatedOrderItem) => {
    // 如果只有一個訂購人，直接顯示名稱
    if (item.userCount === 1) {
      return <div>{item.userNames[0]}</div>;
    }
    
    // 多個訂購人時，顯示第一位訂購人 + 懸停顯示全部
    return (
      <div className="group relative inline-block">
        <div className="cursor-help flex items-center">
          <span className="font-medium">{item.userNames[0]}</span>
          <span className="text-sm text-gray-500 ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full">+{item.userCount - 1}人</span>
          <span className="ml-1 text-blue-500 text-xs">▼</span>
        </div>
        
        {/* 懸停時顯示的 tooltip - 新增網格區域來拖住滑鼠 */}
        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity delay-75 duration-200 absolute z-10 left-0 mt-1">
          {/* 網格區域，帶有全20px的padding以增加滑鼠懸停空間 */}
          <div className="p-5 -mt-2 -mx-5">
            <div className="w-64 p-3 bg-white border border-gray-200 rounded-md shadow-lg text-sm">
              <div className="font-medium text-gray-700 pb-1 border-b border-gray-200 mb-2">所有訂購人 ({item.userCount} 人合計訂購 {item.quantity} 份)</div>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {/* 使用 userOrders 資料結構約和訂購數量 */}
                {Object.entries(
                  // 計算每位使用者的總訂購數量
                  item.userOrders.reduce((acc: Record<string, number>, order) => {
                    acc[order.userName] = (acc[order.userName] || 0) + order.quantity;
                    return acc;
                  }, {})
                )
                .sort((a, b) => b[1] - a[1]) // 按數量降序排列
                .map(([userName, quantity]) => (
                  <li key={userName} className="flex justify-between items-center hover:bg-gray-50 px-1.5 py-1 rounded">
                    <span className="text-gray-700">{userName}</span>
                    <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-full">訂購 {quantity} 份</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染付款視圖的用戶訂單詳情
  const renderOrderDetails = (details: PaymentViewItem['orderDetails']) => {
    return (
      <div className="group relative inline-block">
        <div className="cursor-help flex items-center">
          <span className="font-medium">{details[0].menuItemName}</span>
          {details.length > 1 && (
            <span className="text-sm text-gray-500 ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full">
              +{details.length - 1}項
            </span>
          )}
          <span className="ml-1 text-blue-500 text-xs">▼</span>
        </div>
        
        {/* 懸停時顯示的 tooltip */}
        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity delay-75 duration-200 absolute z-10 left-0 mt-1">
          <div className="p-5 -mt-2 -mx-5">
            <div className="w-64 p-3 bg-white border border-gray-200 rounded-md shadow-lg text-sm">
              <div className="font-medium text-gray-700 pb-1 border-b border-gray-200 mb-2">
                訂購項目明細 ({details.length} 項)
              </div>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-center justify-between hover:bg-gray-50 px-1.5 py-1 rounded">
                    <span className="text-gray-700">{detail.menuItemName} {detail.quantity}份</span>
                    <span className="text-gray-600">$ {detail.subtotal}</span>
                    {detail.notes && (
                      <span className="text-xs italic text-gray-500 ml-1">({detail.notes})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染付款進度
  const renderPaymentProgress = () => {
    const percentage = paymentSummary.total > 0 
      ? Math.round((paymentSummary.collected / paymentSummary.total) * 100) 
      : 0;
      
    // 根據百分比選擇對應的寬度類別
    const getWidthClass = (percent: number) => {
      if (percent <= 0) return 'w-0';
      if (percent <= 5) return 'w-1/20';
      if (percent <= 10) return 'w-1/12';
      if (percent <= 15) return 'w-1/8';
      if (percent <= 20) return 'w-1/5';
      if (percent <= 25) return 'w-1/4';
      if (percent <= 30) return 'w-3/10';
      if (percent <= 33) return 'w-1/3';
      if (percent <= 40) return 'w-2/5';
      if (percent <= 45) return 'w-9/20';
      if (percent <= 50) return 'w-1/2';
      if (percent <= 55) return 'w-11/20';
      if (percent <= 60) return 'w-3/5';
      if (percent <= 66) return 'w-2/3';
      if (percent <= 70) return 'w-7/10';
      if (percent <= 75) return 'w-3/4';
      if (percent <= 80) return 'w-4/5';
      if (percent <= 90) return 'w-9/10';
      return 'w-full';
    };
    
    // 依序顯示已收/待收和收款進度
    return (
      <div className="w-full">
        {/* 標題列 - 全部依序靠左排列 */}
        <div className="flex flex-wrap items-center space-x-5 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-base font-medium text-gray-700">收款狀態：</span>
            <span className="text-base">
              <span className="font-bold text-green-600">$ {paymentSummary.collected}</span>
              <span className={percentage === 100 ? 'text-green-600' : 'text-gray-700'}> / </span>
              <span className={`font-bold ${percentage === 100 ? 'text-green-600' : 'text-red-500'}`}>$ {paymentSummary.total}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-medium text-gray-700">收款進度：</span>
            <span className="text-base bg-green-100 text-green-800 py-0.5 px-2 rounded-full font-medium">{percentage}%</span>
          </div>
        </div>
        
        {/* 進度條 - 與表格同寬 */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`bg-green-500 h-3 rounded-full transition-all duration-500 ease-in-out ${getWidthClass(percentage)}`} 
          ></div>
        </div>
      </div>
    );
  };

  return (
    <>
      {tooltipPortal}
      <div className={`bg-white rounded-lg shadow-md relative ${className}`}>
      {/* 頁籤容器 - 確保寬度一致 */}
      <div className="sticky top-0 z-10 bg-gray-100 overflow-hidden border-b border-gray-200">
        <div className="px-4 pt-1">
          <div className="inline-flex">
            <button
              type="button"
              disabled={isSubmitted}
              className={`relative py-2 px-8 text-sm font-medium rounded-t-lg ${activeTab === 'order' 
                ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200 shadow-sm -mb-px' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'} 
                ${isSubmitted ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isSubmitted) {
                  setActiveTab('order');
                }
              }}
            >
              {isSubmitted && (
                <span className="absolute -right-1 -top-1 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              訂購
            </button>
            <div className="relative" 
                onMouseOver={() => {
                  if (disablePaymentTab && !isSubmitted) setShowTooltip(true);
                }}
                onMouseMove={() => {
                  if (disablePaymentTab && !isSubmitted && !showTooltip) setShowTooltip(true);
                }}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <button
                  ref={paymentTabRef}
                  type="button"
                  disabled={disablePaymentTab && !isSubmitted}
                  className={`relative py-2 px-8 text-sm font-medium rounded-t-lg ${activeTab === 'payment' 
                    ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200 shadow-sm -mb-px' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'} 
                    ${disablePaymentTab && !isSubmitted ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!disablePaymentTab || isSubmitted) {
                      setActiveTab('payment');
                    }
                  }}
                >
                  收款
                </button>
                {/* 使用 Portal 顯示提示訊息，無需在這裡添加提示元素 */}
              </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {activeTab === 'order' ? (
          // 訂購頁籤 - 保留原始表格內容
          <div className="inline-block min-w-full align-middle">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    品名
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    單價
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    數量
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    小計
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    訂購人
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consolidatedItems.length > 0 ? (
                  consolidatedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div>{item.menuItemName}</div>
                        {item.notes && (
                          <div className="text-xs italic text-gray-500 mt-1">
                            備註：{item.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $ {item.unitPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $ {item.subtotal}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatUserDisplay(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!readOnly && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteItem(item);
                            }}
                            className="text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer"
                            aria-label="刪除項目"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {emptyStateMessage}
                    </td>
                  </tr>
                )}
              </tbody>
              {/* 總計金額行 */}
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-left text-base font-bold text-gray-900">
                    總計金額：$ {calculateTotal()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          // 收款頁籤 - 新增付款視圖 - 使用與訂購頁籤相同的結構
          <div className="inline-block min-w-full align-middle">
            <table className="w-full divide-y divide-gray-200">
              <thead className="sticky top-0 z-20 shadow-sm">
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    訂購人
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    付款狀態
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    品名
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    總金額
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentViewItems.length > 0 ? (
                  paymentViewItems.map((item) => (
                    <tr key={item.userId}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePaymentStatusChange(item.userId, !item.isPaid, item.total);
                            }}
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors cursor-pointer
                              ${item.isPaid 
                                ? 'bg-green-500 border-green-600 text-white' 
                                : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                              }`}
                            aria-label={item.isPaid ? "已付款" : "未付款"}
                          >
                            {item.isPaid && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          <span className={item.isPaid ? 'text-green-600' : 'text-gray-500'}>
                            {item.isPaid ? '已付款' : '未付款'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {renderOrderDetails(item.orderDetails)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $ {item.total}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      {emptyStateMessage}
                    </td>
                  </tr>
                )}
              </tbody>
              {/* 收款進度條 - 放在表格的 tfoot 中，與訂購頁籤結構一致 */}
              {paymentViewItems.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-6 py-4">
                      {renderPaymentProgress()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
      </div>
      

    </>
  );
};

export default OrderItemsTable;