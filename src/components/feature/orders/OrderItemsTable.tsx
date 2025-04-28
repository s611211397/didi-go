'use client';

import React from 'react';
import { OrderItemsTableProps } from './types';
import OrderTabs from './OrderTabs';
import OrderTabContent from './OrderTabContent';
import PaymentTabContent from './PaymentTabContent';
import { useOrderItemsLogic } from './hooks/useOrderItemsLogic';

/**
 * 訂單項目表格元件
 * 用於顯示訂單的詳細項目，包含商品名稱、價格、數量等資訊
 * 相同品名和相同備註的訂單會被合併顯示，並提供訂購和收款兩個頁籤視圖
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
}) => {
  const { activeTab, setActiveTab } = useOrderItemsLogic({ 
    orderItems, 
    isSubmitted 
  });

  return (
    <div className={`bg-white rounded-lg shadow-md relative ${className}`}>
      {/* 頁籤導航 */}
      <OrderTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
