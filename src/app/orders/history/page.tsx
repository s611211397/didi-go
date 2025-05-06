'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import MobileNavBar from '@/components/layout/MobileNavBar';
import { getUserOrders, deleteOrder } from '@/services/order';
import { Order } from '@/type/order';
import { OrderStatus, Timestamp } from '@/type/common';
import MessageDialog from '@/components/ui/dialog/MessageDialog';

// 公用格式化/顯示函數
const isTimestamp = (value: unknown): value is Timestamp => {
  return value !== null && typeof value === 'object' && 'toDate' in (value as object) && typeof (value as Timestamp).toDate === 'function';
};

// 格式化日期時間
const formatDateTime = (timestamp: Timestamp | Date | null | undefined): string => {
  if (!timestamp) return '';
  
  const date = isTimestamp(timestamp) ? timestamp.toDate() : timestamp as Date;
  
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 獲取訂單狀態標籤
const getStatusLabel = (status: OrderStatus): { label: string; color: string } => {
  switch (status) {
    case OrderStatus.ORDERING:
      return { label: '訂購中', color: 'bg-yellow-100 text-yellow-800' };
    case OrderStatus.COLLECTING:
      return { label: '收款中', color: 'bg-blue-100 text-blue-800' };
    case OrderStatus.COMPLETED:
      return { label: '已完成', color: 'bg-green-100 text-green-800' };
    default:
      return { label: '未知狀態', color: 'bg-gray-100 text-gray-800' };
  }
};

// 獲取餐廳名稱（從訂單標題中提取）
const getRestaurantName = (title: string, tags?: string[]): string => {
  return title.split('從')[1]?.split('訂購')[0].trim() || tags?.[0] || '未知餐廳';
};

// 訂單歷史頁面元件
const OrderHistoryPage: React.FC = () => {
  const { currentUser: user, loading } = useAuth();
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<string>('');
  
  // 檢查用戶是否已登入
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // 獲取訂單資料
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const orders = await getUserOrders(user.uid);
        
        // 分類訂單
        const active = orders.filter(
          order => order.status === OrderStatus.ORDERING || order.status === OrderStatus.COLLECTING
        );
        
        const completed = orders
          .filter(order => order.status === OrderStatus.COMPLETED)
          .sort((a, b) => {
            // 按創建時間排序，最新的排在前面
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
          })
          .slice(0, 10); // 只保留最近 10 個
        
        setActiveOrders(active);
        setCompletedOrders(completed);
      } catch (error) {
        console.error('獲取訂單失敗:', error);
        setError('獲取訂單失敗，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  // 處理點擊訂單卡片
  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/create/details?id=${orderId}`);
  };
  
  // 處理刪除訂單
  const handleDeleteClick = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發行點擊事件
    setOrderToDelete(orderId);
    setShowDeleteDialog(true);
  };
  
  // 確認刪除訂單
  const confirmDelete = async () => {
    try {
      await deleteOrder(orderToDelete);
      // 更新本地狀態
      setActiveOrders(activeOrders.filter(order => order.id !== orderToDelete));
      setShowDeleteDialog(false);
      setOrderToDelete('');
    } catch (error) {
      console.error('刪除訂單失敗:', error);
      setError('刪除訂單失敗，請稍後再試');
    }
  };
  
  // 渲染頁面
  if (loading || !user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 顯示錯誤信息 */}
      {error && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        </div>
      )}
      
      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <h2 className="text-xl font-semibold text-[#484848] mb-6">訂單歷史</h2>
        
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-[#767676]">載入中...</p>
          </div>
        ) : (
          <>
            {/* 進行中的訂單 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-[#484848] mb-4">進行中訂單</h3>
              {activeOrders.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-[#484848]">餐廳</th>
                          <th className="px-4 py-3 text-[#484848]">訂單標題</th>
                          <th className="px-4 py-3 text-[#484848]">截止時間</th>
                          <th className="px-4 py-3 text-[#484848]">狀態</th>
                          <th className="px-4 py-3 text-[#484848]">總金額</th>
                          <th className="px-4 py-3 text-[#484848]">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOrders.map((order) => {
                          const statusInfo = getStatusLabel(order.status);
                          return (
                            <tr 
                              key={order.id} 
                              className="border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleOrderClick(order.id)}
                            >
                              <td className="px-4 py-3 text-[#484848]">
                                {getRestaurantName(order.title, order.tags)}
                              </td>
                              <td className="px-4 py-3 text-[#484848] max-w-xs truncate">
                                {order.title}
                              </td>
                              <td className="px-4 py-3 text-[#767676]">
                                {formatDateTime(order.deadlineTime)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs ${statusInfo.color} px-2 py-1 rounded-full`}>
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#767676]">
                                ${order.totalAmount || 0}
                              </td>
                              <td className="px-4 py-3">
                                {order.status === OrderStatus.ORDERING && (
                                  <button 
                                    onClick={(e) => handleDeleteClick(order.id, e)}
                                    className="text-red-500 hover:text-red-700"
                                    aria-label="刪除訂單"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-[#767676]">目前沒有進行中的訂單</p>
                </div>
              )}
            </div>
            
            {/* 已完成的訂單 */}
            <div>
              <h3 className="text-lg font-medium text-[#484848] mb-4">最近完成的訂單</h3>
              {completedOrders.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-[#484848]">餐廳</th>
                          <th className="px-4 py-3 text-[#484848]">訂單標題</th>
                          <th className="px-4 py-3 text-[#484848]">截止時間</th>
                          <th className="px-4 py-3 text-[#484848]">狀態</th>
                          <th className="px-4 py-3 text-[#484848]">總金額</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedOrders.map((order) => {
                          const statusInfo = getStatusLabel(order.status);
                          return (
                            <tr 
                              key={order.id} 
                              className="border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleOrderClick(order.id)}
                            >
                              <td className="px-4 py-3 text-[#484848]">
                                {getRestaurantName(order.title, order.tags)}
                              </td>
                              <td className="px-4 py-3 text-[#484848] max-w-xs truncate">
                                {order.title}
                              </td>
                              <td className="px-4 py-3 text-[#767676]">
                                {formatDateTime(order.deadlineTime)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs ${statusInfo.color} px-2 py-1 rounded-full`}>
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#767676]">
                                ${order.totalAmount || 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-[#767676]">尚無已完成的訂單</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* 底部導航區域 (手機版) */}
      <MobileNavBar />
      
      {/* 刪除確認對話框 */}
      <MessageDialog
        show={showDeleteDialog}
        type="confirm"
        title="確認刪除訂單"
        message="確定要刪除此訂單嗎？此操作無法恢復。"
        primaryButton={{
          text: "確認刪除",
          variant: "danger",
          onClick: confirmDelete
        }}
        secondaryButton={{
          text: "取消",
          variant: "outline",
          onClick: () => {
            setShowDeleteDialog(false);
            setOrderToDelete('');
          }
        }}
        onClose={() => {
          setShowDeleteDialog(false);
          setOrderToDelete('');
        }}
      />
    </div>
  );
};

export default OrderHistoryPage;