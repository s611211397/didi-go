'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import MobileNavBar from '@/components/layout/MobileNavBar';
import AddOrderItemDialog from '@/components/feature/orders/AddOrderItemDialog';
import OrderItemsTable from '@/components/feature/orders/OrderItemsTable';
import { MessageDialog } from '@/components/ui/dialog';
import { getOrder, getOrderItems, deleteOrderItem, updateOrderStatus } from '@/services/order';
import { Order, OrderItem } from '@/type/order';
import { Timestamp, OrderStatus } from '@/type/common';

// 訂單表單值的類型定義
interface OrderFormValues {
  orderItems: OrderItem[];
}

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

  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  
  // 使用 react-hook-form
  const methods = useForm<OrderFormValues>({
    defaultValues: {
      orderItems: []
    }
  });

  // 確保組件已掌載，用於解決樣式閃爍問題
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
        // 獲取訂單主資訊
        const orderData = await getOrder(orderId);
        
        if (orderData) {
          setOrder(orderData);
          
          // 設置表單預設值
          methods.reset({
            orderItems: []
          });
          
          // 獲取訂單項目
          const items = await getOrderItems(orderId);
          setOrderItems(items);
        } else {
          setError('找不到訂單資訊');
        }
      } catch (err) {
        console.error('獲取訂單資訊失敗:', err);
        setError('無法獲取訂單資訊，請稍後再試');
      }
    };

    fetchOrderDetails();
  }, [user, orderId, methods]);

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
  
  // 刪除訂單項目 - 優化後的版本支援批量刪除
  const handleDeleteItem = async (itemId: string, itemsToDelete?: string[]) => {
    if (!orderId) return;
    
    try {
      // 如果提供了多個 ID，就批量刪除
      if (itemsToDelete && itemsToDelete.length > 0) {
        // 刪除所有指定的項目
        await Promise.all(itemsToDelete.map(id => deleteOrderItem(orderId, id)));
        // 更新 UI，移除所有已刪除的項目
        setOrderItems(orderItems.filter(item => !itemsToDelete.includes(item.id)));
      } else {
        // 引用現有的刪除邏輯處理單個項目
        await deleteOrderItem(orderId, itemId);
        setOrderItems(orderItems.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('刪除訂單項目失敗:', error);
      setError('刪除訂單項目失敗，請稍後再試');
    }
  };
  
  // 開啟新增商品對話框
  const handleAddItem = () => {
    // 如果訂單已提交，則不允許新增商品
    if (isSubmitted) return;
    
    if (order && orderId) {
      // 確保先關閉對話框，然後再重新開啟，以避免重複錄入導致的閃爍
      setShowAddItemDialog(false);
      // 使用setTimeout確保先關閉後再開啟，避免狀態更新不當
      setTimeout(() => {
        setShowAddItemDialog(true);
      }, 10);
    }
  };
  
  // 處理商品新增完成後的刷新
  const handleItemAdded = async () => {
    if (orderId) {
      try {
        // 重新獲取訂單項目
        const items = await getOrderItems(orderId);
        setOrderItems(items);
        // 顯示成功訊息
        setError(''); // 清除任何存在的錯誤訊息
      } catch (err) {
        console.error('刷新訂單項目失敗:', err);
        setError('無法刷新訂單項目，請稍後再試');
      }
    }
  };

  // 處理表單提交
  const onSubmit = () => {
    // 顯示確認對話框
    setShowConfirmDialog(true);
  };


  // 處理訂單提交
  const handleSubmitOrder = async () => {
    if (!orderId || !order) return;
    
    try {
      // 關閉確認對話框
      setShowConfirmDialog(false);
      
      // 獨立更新訂單狀態
      await updateOrderStatus(orderId, OrderStatus.COMPLETED);
      
      // 更新訂單已提交狀態
      setIsSubmitted(true);
      setError('');
      
      // 移除原生 alert 提示，避免重複提示
    } catch (err) {
      console.error('提交訂單失敗:', err);
      setError('提交訂單失敗，請稍後再試');
    }
  };

  // 如果正在載入用戶資訊，返回空
  if (loading || !user) {
    return null;
  }

  // 如果尚未掌載完成，返回空以避免樣式閃爍
  if (!mounted) {
    return <div className="min-h-screen bg-[#F7F7F7]"></div>;
  }

  return (
    <form onSubmit={(e) => {
      // 判斷提交是否來自提交按鈕
      // 如果是按鈕觸發的，正常提交
      // 否則阻止提交，避免意外觸發
      
      // 取消默認提交行為，改為手動控制
      e.preventDefault();
      
      // 正常提交流程
      methods.handleSubmit(onSubmit)(e);
    }}>
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
            
            {order ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <span className="text-lg text-gray-700 mr-2">餐廳：</span>
                    <span className="font-medium">
                      {order.title.split('從')[1]?.split('訂購')[0].trim() || order.tags?.[0] || '未知餐廳'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg text-gray-700 mr-2">截止時間：</span>
                    <span className="font-medium">{formatDateTime(order.deadlineTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg text-gray-700 mr-2">預計送達：</span>
                    <span className="font-medium">
                      {order.estimatedDeliveryTime 
                        ? formatDateTime(order.estimatedDeliveryTime) 
                        : '未設定'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-center text-gray-500">
                無法顯示訂單資訊
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
              disabled={isSubmitted}
              className={isSubmitted ? "opacity-60 cursor-not-allowed" : ""}
            >
              新增商品
            </Button>
          </div>

          {/* 訂單表格 */}
          <OrderItemsTable
            orderItems={orderItems}
            onDeleteItem={handleDeleteItem}
            emptyStateMessage="目前沒有訂單項目，請點擊上方「新增商品」按鈕開始訂購。"
            isOrderCreator={order?.organizerId === user?.uid}
            isSubmitted={isSubmitted}
            disablePaymentTab={!isSubmitted}
            readOnly={isSubmitted}
          />



          {/* 底部操作按鈕 (電腦版) */}
          <div className="hidden md:flex justify-end mt-6 space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              返回
            </Button>
            {!isSubmitted && (
              <Button
                type="submit"
                variant="primary"
              >
                確認訂單
              </Button>
            )}
          </div>
          
          {/* 底部操作按鈕 (手機版) - 固定在畫面右下角 */}
          {!isSubmitted && (
            <div className="fixed bottom-20 right-6 md:hidden z-10">
              <Button 
                type="submit" 
                variant="primary"
                className="shadow-lg rounded-full px-6 py-3"
              >
                提交訂單
              </Button>
            </div>
          )}
        </div>
        
        {/* 底部導航區域 (手機版) */}
        <MobileNavBar />
        
        {/* 新增商品對話框 */}
        {orderId && order && (
          <AddOrderItemDialog
            show={showAddItemDialog}
            onClose={() => setShowAddItemDialog(false)}
            orderId={orderId}
            restaurantId={order.tags?.[1] || ''} /* 餐廳ID存儲在 tags 的第二個元素 */
            onItemAdded={handleItemAdded}
          />
        )}
        
        {/* 確認提交對話框 */}
        <MessageDialog
          show={showConfirmDialog}
          type="confirm"
          title="確認提交訂單"
          message="提交後將無法再更改訂購內容"
          primaryButton={{
            text: "確認提交",
            variant: "primary",
            onClick: handleSubmitOrder
          }}
          secondaryButton={{
            text: "取消",
            variant: "outline",
            onClick: () => setShowConfirmDialog(false)
          }}
          onClose={() => setShowConfirmDialog(false)}
        />
      </div>
    </form>
  );
};

export default OrderDetailsPage;