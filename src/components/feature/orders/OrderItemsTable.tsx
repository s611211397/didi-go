'use client';

import React, { useMemo, useState } from 'react';
import { OrderItem } from '@/type/order';

interface OrderItemsTableProps {
  orderItems: OrderItem[];
  onDeleteItem: (itemId: string, itemsToDelete?: string[]) => Promise<void> | void;
  emptyStateMessage?: string;
  className?: string;
  readOnly?: boolean;
  isOrderCreator?: boolean; // 添加是否為訂單創建者的屬性
}

interface ConsolidatedOrderItem extends Omit<OrderItem, 'id' | 'userId' | 'userName'> {
  id: string; // 合併後的項目 ID
  originalIds: string[]; // 原始項目 ID 列表，用於刪除操作
  userNames: string[]; // 訂購人列表
  userCount: number; // 訂購人數量
}

/**
 * 訂單項目表格元件
 * 用於顯示訂單的詳細項目，包含商品名稱、價格、數量等資訊
 * 相同品名和相同備註的訂單會被合併顯示
 */
const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  orderItems,
  onDeleteItem,
  emptyStateMessage = "目前沒有訂單項目",
  className = "",
  readOnly = false,
  isOrderCreator = false, // 默認非創建者
}) => {
  // 追蹤展開的用戶列表
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // 合併相同品名和相同備註的訂單項目
  const consolidatedItems = useMemo(() => {
    const itemMap = new Map<string, ConsolidatedOrderItem>();
    
    orderItems.forEach(item => {
      // 創建用於合併的鍵值（品名+備註）
      const key = `${item.menuItemName}|${item.notes || ''}`;
      
      if (itemMap.has(key)) {
        // 如果已有相同項目，則更新數量和小計
        const existingItem = itemMap.get(key)!;
        existingItem.quantity += item.quantity;
        existingItem.subtotal += item.subtotal;
        existingItem.originalIds.push(item.id);
        
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
        });
      }
    });
    
    return Array.from(itemMap.values());
  }, [orderItems]);

  // 計算總金額
  const calculateTotal = (): number => {
    return consolidatedItems.reduce((total, item) => total + item.subtotal, 0);
  };

  // 切換用戶列表展開狀態
  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
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

  // 格式化用戶名稱顯示
  const formatUserDisplay = (item: ConsolidatedOrderItem) => {
    if (item.userCount <= 2) {
      return item.userNames.join(', ');
    }
    
    const isExpanded = expandedItems[item.id];
    if (isExpanded) {
      return (
        <div className="group relative">
          <div className="cursor-pointer text-blue-500" onClick={() => toggleExpand(item.id)}>
            {item.userNames.join(', ')} <span className="text-xs">▲</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="group relative">
          <div className="cursor-pointer text-blue-500" onClick={() => toggleExpand(item.id)}>
            {item.userNames[0]} <span className="text-sm text-gray-500">+{item.userCount - 1}人</span> <span className="text-xs">▼</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
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
                    NT$ {item.unitPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    NT$ {item.subtotal}
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
              <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                總計金額：
              </td>
              <td colSpan={3} className="px-6 py-4 text-left text-base font-bold text-gray-900">
                NT$ {calculateTotal()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderItemsTable;