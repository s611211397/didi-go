'use client';

import React, { useState, useEffect } from 'react';
import { OrderItemsTableProps } from './types';
import OrderTabs from './OrderTabs';
import OrderTabContent from './OrderTabContent';
import PaymentTabContent from './PaymentTabContent';

/**
 * 訂單項目表格元件
 * 顯示訂單的詳細項目，包含訂購和收款兩個頁籤視圖
 */
const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  orderItems,
  onDeleteItem,
  onUpdatePaymentStatus,
  emptyStateMessage = "目前沒有訂單項目",
  className = "",
  readOnly = false,
  isOrderCreator = false,
  isSubmitted = false,
  disablePaymentTab = true,
  onTabChange,
}) => {
  // 頁籤狀態管理
  const [activeTab, setActiveTab] = useState<'order' | 'payment'>(isSubmitted ? 'payment' : 'order');
  
  // 通知父組件當前標籤狀態變化
  const handleTabChange = (tab: 'order' | 'payment') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  
  // 當訂單狀態變更時，更新頁籤狀態
  useEffect(() => {
    if (isSubmitted) {
      setActiveTab('payment');
    }
  }, [isSubmitted]);

  return (
    <div className={`bg-white rounded-lg shadow-md relative ${className}`}>
      {/* 頁籤導航 */}
      <OrderTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isSubmitted={isSubmitted}
        disablePaymentTab={disablePaymentTab}
      />
      
      {/* 內容區域 */}
      <div className="overflow-x-auto">
        {activeTab === 'order' ? (
          <OrderTabContent 
            orderItems={orderItems}
            onDeleteItem={onDeleteItem}
            emptyStateMessage={emptyStateMessage}
            readOnly={readOnly}
            isOrderCreator={isOrderCreator}
          />
        ) : (
          <PaymentTabContent 
            orderItems={orderItems}
            onUpdatePaymentStatus={onUpdatePaymentStatus}
            emptyStateMessage={emptyStateMessage}
          />
        )}
      </div>
    </div>
  );
};

export default OrderItemsTable;
