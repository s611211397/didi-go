'use client';

import { useState, useEffect, useMemo } from 'react';
import { OrderItem } from '@/type/order';
import { ConsolidatedOrderItem, PaymentViewItem, UserOrderInfo } from '../types';

interface UseOrderItemsLogicProps {
  orderItems: OrderItem[];
  isSubmitted?: boolean;
}

/**
 * 訂單項目邏輯 Hook
 * 處理訂單項目的邏輯操作，包括資料轉換、狀態管理等
 */
export function useOrderItemsLogic({ orderItems, isSubmitted }: UseOrderItemsLogicProps) {
  // 頁籤狀態
  const [activeTab, setActiveTab] = useState<'order' | 'payment'>(isSubmitted ? 'payment' : 'order');
  
  // 付款狀態管理
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>({});
  
  // 提示顯示狀態
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  
  // 當訂單狀態變更時，更新頁籤狀態
  useEffect(() => {
    if (isSubmitted) {
      setActiveTab('payment');
    }
  }, [isSubmitted]);
  
  // 初始化付款狀態
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
  
  // 付款視圖數據
  const paymentViewItems = useMemo(() => {
    const userMap = new Map<string, PaymentViewItem>();
    
    orderItems.forEach(item => {
      if (!userMap.has(item.userId)) {
        // 為每個用戶創建新條目
        userMap.set(item.userId, {
          userId: item.userId,
          userName: item.userName,
          isPaid: paymentStatus[item.userId] ?? false,
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
  
  // 計算收款摘要
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

  // 更新付款狀態
  const updatePaymentStatus = (userId: string, isPaid: boolean) => {
    setPaymentStatus(prev => ({
      ...prev,
      [userId]: isPaid
    }));
  };

  return {
    activeTab,
    setActiveTab,
    showTooltip,
    setShowTooltip,
    paymentStatus,
    updatePaymentStatus,
    consolidatedItems,
    paymentViewItems,
    paymentSummary,
    calculateTotal
  };
}
