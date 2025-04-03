'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import MobileNavBar from '@/components/layout/MobileNavBar';
import { getOrder, getOrderItems, deleteOrderItem } from '@/services/order';
import { Order, OrderItem } from '@/type/order';
import { Timestamp } from '@/type/common';

/**
 * 訂單明細頁面元件
 * 顯示訂單的詳細資訊、訂購項目列表
 */
const OrderDetailsPage: React.FC = () => {
  const { currentUser: user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);
  
  // 確保組件已掛載，用於解決樣式閃爍問題
  useEffect(() => {
    setMounted(true);
  }, []);

  // 檢查用戶是否已登入
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // 從 Firebase 獲取訂單資訊和訂單項目
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !orderId) return;
      
      try {
        setIsLoading(true);
        
        // 獲取訂單主資訊
        const orderData = await getOrder(orderId);
        
        if (orderData) {
          setOrder(orderData);
          
          // 獲取訂單項目
          const items = await getOrderItems(orderId);
          setOrderItems(items);
        } else {
          setError('找不到訂單資訊');
        }
      } catch (err) {
        console.error('獲取訂單資訊失敗:', err);
        setError('無法獲取訂單資訊，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [user, orderId]);

  // 計算總金額
  const calculateTotal = (): number => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0);
  };

  // 類型守衛，檢查是否為 Timestamp 類型
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
  
  // 刪除訂單項目
  const handleDeleteItem = async (itemId: string) => {
    if (!orderId) return;
    
    try {
      await deleteOrderItem(orderId, itemId);
      setOrderItems(orderItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('刪除訂單項目失敗:', error);
      setError('刪除訂單項目失敗，請稍後再試');
    }
  };
  
  // 新增訂單項目 (導向到菜單頁面)
  const handleAddItem = () => {
    if (order && orderId) {
      // 假設可以從 order 的 tags 獲取餐廳 ID，或從 description 中提取
      const restaurantId = order.tags?.[0] || '';
      
      // 導向到餐廳菜單頁面，並傳遞訂單 ID
      router.push(`/restaurants/menu?restaurantId=${restaurantId}&orderId=${orderId}`);
    }
  };

  // 如果正在載入用戶資訊，返回空
  if (loading || !user) {
    return null;
  }

  // 如果尚未掛載完成，返回空以避免樣式閃爍
  if (!mounted) {
    return <div className="min-h-screen bg-[#F7F7F7]"></div>;
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
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-8">
        {/* 訂單標題區塊 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">訂單明細</h1>
          
          {order ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">餐廳：</span>
                <span className="font-medium">
                  {order.title.split('從')[1]?.split('訂購')[0].trim() || order.tags?.[0] || '未知餐廳'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">截止時間：</span>
                <span className="font-medium">{formatDateTime(order.deadlineTime)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">預計送達：</span>
                <span className="font-medium">
                  {order.estimatedDeliveryTime 
                    ? formatDateTime(order.estimatedDeliveryTime) 
                    : '未設定'}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              {isLoading ? '載入訂單資訊中...' : '無法顯示訂單資訊'}
            </div>
          )}
        </div>

        {/* 訂購商品按鈕 */}
        <div className="mb-6">
          <Button 
            type="button" 
            variant="primary"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            }
            onClick={handleAddItem}
          >
            新增商品
          </Button>
        </div>

        {/* 訂單表格 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    菜名
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
                {orderItems.length > 0 ? (
                  orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.menuItemName}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-[#EF4444] hover:text-[#DC2626] transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      目前沒有訂單項目，請點擊上方「新增商品」按鈕開始訂購。
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

        {/* 底部操作按鈕 (電腦版) */}
        <div className="hidden md:flex justify-end mt-6 space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            返回
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              // TODO: 實作訂單提交功能
              alert('訂單已提交');
              router.push('/orders');
            }}
          >
            提交訂單
          </Button>
        </div>
        
        {/* 底部操作按鈕 (手機版) - 固定在畫面右下角 */}
        <div className="fixed bottom-20 right-6 md:hidden z-10">
          <Button 
            type="button" 
            variant="primary"
            className="shadow-lg rounded-full px-6 py-3" 
            onClick={() => {
              // TODO: 實作訂單提交功能
              alert('訂單已提交');
              router.push('/orders');
            }}
          >
            提交訂單
          </Button>
        </div>
      </div>
      
      {/* 底部導航區域 (手機版) */}
      <MobileNavBar />
    </div>
  );
};

export default OrderDetailsPage;