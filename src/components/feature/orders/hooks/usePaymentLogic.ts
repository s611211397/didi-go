'use client';

import { useMemo, useState, useEffect } from 'react';
import { OrderItem } from '@/type/order';
import { PaymentViewItem } from '../types';

interface UsePaymentLogicProps {
  orderItems: OrderItem[];
}

/**
 * 收款功能邏輯 Hook
 * 專門處理收款相關的資料處理和狀態管理
 */
export function usePaymentLogic({ orderItems }: UsePaymentLogicProps) {
  // 付款狀態管理
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>({});
  
  // 初始化付款狀態
  useEffect(() => {
    // 確保所有用戶的付款狀態都被正確初始化
    const statusMap: Record<string, boolean> = {};
    const userNameMap: Record<string, string> = {}; // 用於追蹤自定義用戶名稱和ID的映射
    
    orderItems.forEach(item => {
      const isCustomUser = item.userId.startsWith('custom_');
      
      // 對於自定義用戶，檢查是否已經有相同名稱的用戶存在
      if (isCustomUser) {
        const existingUserId = userNameMap[item.userName];
        
        // 如果已經有同名的用戶，則使用已存在的付款狀態
        if (existingUserId && statusMap[existingUserId] !== undefined) {
          statusMap[item.userId] = statusMap[existingUserId];
        } 
        // 否則設置新的付款狀態
        else if (statusMap[item.userId] === undefined) {
          statusMap[item.userId] = item.isPaid || false;
          userNameMap[item.userName] = item.userId; // 記錄此用戶名和ID的映射
        }
      } 
      // 對於系統用戶，正常設置付款狀態
      else if (statusMap[item.userId] === undefined) {
        statusMap[item.userId] = item.isPaid || false;
      }
    });
    
    setPaymentStatus(statusMap);
  }, [orderItems]);

  // 計算每個用戶的付款資訊
  const paymentViewItems = useMemo(() => {
    // 使用強類型的 Map 確保處理正確
    const userMap = new Map<string, PaymentViewItem>();
    
    // 檢查是否有資料
    if (!orderItems || orderItems.length === 0) {
      return [];
    }
    
    // 只進行一次迴圈，同時處理用戶基本資訊和訂單詳情
    orderItems.forEach(item => {
      if (!item.userId) return; // 防禦性程式設計，確保有 userId
      
      // 為用戶創建一個唯一鍵
      // 對於自定義用戶（以 custom_ 開頭的 userId），使用用戶名稱作為鍵
      // 對於系統用戶，使用 userId 作為鍵
      const isCustomUser = item.userId.startsWith('custom_');
      const userKey = isCustomUser ? `name_${item.userName}` : item.userId;
      
      // 如果用戶不存在於 Map 中，創建新條目
      if (!userMap.has(userKey)) {
        userMap.set(userKey, {
          userId: item.userId, // 保留原始 userId 用於功能操作
          userName: item.userName,
          isPaid: paymentStatus[item.userId] ?? false,
          total: 0,
          orderDetails: []
        });
      }
      
      // 獲取用戶項目
      const userItem = userMap.get(userKey)!;
      
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
    
    // 轉換 Map 為陣列並返回
    return Array.from(userMap.values());
  }, [orderItems, paymentStatus]);
  
  // 計算收款摘要
  const paymentSummary = useMemo(() => {
    let collected = 0;
    let total = 0;
    
    paymentViewItems.forEach(item => {
      total += item.total;
      if (item.isPaid) {
        collected += item.total;
      }
    });
    
    return { 
      collected, 
      total,
      percentage: total > 0 ? Math.round((collected / total) * 100) : 0
    };
  }, [paymentViewItems]);

  // 更新付款狀態
  const updatePaymentStatus = (userId: string, isPaid: boolean) => {
    setPaymentStatus(prev => ({
      ...prev,
      [userId]: isPaid
    }));
  };

  // 加入除錯資訊，幫助理解處理了多少用戶
  console.log(`處理了 ${paymentViewItems.length} 個用戶的付款資訊`);
  
  return {
    paymentViewItems,
    paymentSummary,
    updatePaymentStatus
  };
}
