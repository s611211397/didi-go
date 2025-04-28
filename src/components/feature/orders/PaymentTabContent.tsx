'use client';

import React, { useEffect } from 'react';
import { PaymentTabContentProps } from './types';
import OrderDetailsTooltip from './OrderDetailsTooltip';
import PaymentProgressBar from './PaymentProgressBar';
import { usePaymentLogic } from './hooks/usePaymentLogic';

/**
 * 收款頁籤內容元件
 * 顯示按用戶分組的付款狀態和訂單明細
 */
const PaymentTabContent: React.FC<PaymentTabContentProps> = ({
  orderItems,
  onUpdatePaymentStatus,
  emptyStateMessage = "目前沒有訂單項目"
}) => {
  // 使用專用的收款邏輯 Hook
  const { paymentViewItems, paymentSummary, updatePaymentStatus } = usePaymentLogic({ 
    orderItems: orderItems || [] 
  });
  
  // 除錯輸出：確認收到的訂單項目數量
  useEffect(() => {
    console.log(`PaymentTabContent 收到 ${orderItems?.length || 0} 個訂單項目`);
    console.log(`處理後產生 ${paymentViewItems?.length || 0} 個用戶付款項目`);
  }, [orderItems, paymentViewItems]);
  
  // 處理付款狀態更新
  const handlePaymentStatusChange = (userId: string, isPaid: boolean, amount: number) => {
    // 更新本地狀態
    updatePaymentStatus(userId, isPaid);
    
    // 通知父組件
    if (onUpdatePaymentStatus) {
      onUpdatePaymentStatus(userId, isPaid, amount);
    }
  };

  // 如果沒有訂單項目，顯示空狀態
  if (!orderItems || orderItems.length === 0 || paymentViewItems.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {emptyStateMessage}
      </div>
    );
  }

  return (
    <div className="inline-block min-w-full align-middle">
      <table className="w-full divide-y divide-gray-200">
        <thead className="sticky top-0 z-20 shadow-sm bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              訂購人
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              付款狀態
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              品名
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              總金額
            </th>
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {paymentViewItems.map((item) => (
            <tr key={item.userId}>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {item.userName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handlePaymentStatusChange(item.userId, !item.isPaid, item.total)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      item.isPaid 
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
                <OrderDetailsTooltip details={item.orderDetails} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                $ {item.total}
              </td>
            </tr>
          ))}
        </tbody>
        
        {/* 收款進度條 */}
        {paymentViewItems.length > 0 && (
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-6 py-4">
                <PaymentProgressBar 
                  collected={paymentSummary.collected}
                  total={paymentSummary.total} 
                />
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default PaymentTabContent;
