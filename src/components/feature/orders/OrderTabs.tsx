'use client';

import React, { useRef, useState } from 'react';
import { OrderTabsProps } from './types';
import TabTooltip from './TabTooltip';

/**
 * 訂單頁籤導航元件
 * 提供訂購和收款頁籤的切換功能
 */
const OrderTabs: React.FC<OrderTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  isSubmitted = false,
  disablePaymentTab = true 
}) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const paymentTabRef = useRef<HTMLButtonElement>(null);

  return (
    <>
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
                  onTabChange('order');
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
                    onTabChange('payment');
                  }
                }}
              >
                收款
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示元件展示提示信息 */}
      <TabTooltip 
        show={showTooltip && disablePaymentTab && !isSubmitted}
        message="點擊右下角「確認訂單」按鈕，開啟收款功能"
        referenceElement={paymentTabRef}
      />
    </>
  );
};

export default OrderTabs;
