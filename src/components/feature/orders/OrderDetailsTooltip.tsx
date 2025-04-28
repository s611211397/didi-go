'use client';

import React from 'react';
import { OrderDetailsTooltipProps } from './types';

/**
 * 訂單詳情提示元件
 * 在收款頁籤中顯示用戶訂購的詳細項目
 */
const OrderDetailsTooltip: React.FC<OrderDetailsTooltipProps> = ({ details }) => {
  // 計算單價的工具函數
  const calculateUnitPrice = (subtotal: number, quantity: number) => {
    return quantity > 0 ? Math.round(subtotal / quantity) : 0;
  };
  
  // 如果只有一個項目，直接顯示品項名稱、單價和數量
  if (details.length === 1) {
    const item = details[0];
    const unitPrice = calculateUnitPrice(item.subtotal, item.quantity);
    
    return (
      <div className="flex items-center">
        <span className="text-gray-700">
          {item.menuItemName} $ {unitPrice} x {item.quantity}份
          {item.notes && <span className="text-xs italic text-gray-500 ml-1">({item.notes})</span>}
        </span>
      </div>
    );
  }
  
  // 多個項目時使用懸停式提示
  return (
    <div className="group relative inline-block">
      <div className="cursor-help flex items-center">
        <span className="font-medium">{details[0].menuItemName}</span>
        <span className="text-sm text-gray-500 ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full">
          +{details.length - 1}項
        </span>
        <span className="ml-1 text-blue-500 text-xs">▼</span>
      </div>
      
      {/* 懸停時顯示的提示框 */}
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-10 left-0 mt-2">
        <div className="w-64 p-3 bg-white border border-gray-200 rounded-md shadow-lg text-sm">
          <div className="font-medium text-gray-700 pb-1 border-b border-gray-200 mb-2">
            訂購項目明細 ({details.length} 項)
          </div>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {details.map((item, index) => (
              <li key={index} className="flex items-center justify-between hover:bg-gray-50 px-1.5 py-1 rounded">
                <div>
                  <span className="text-gray-700">{item.menuItemName}</span>
                  {item.notes && <span className="text-xs italic text-gray-500 ml-1">({item.notes})</span>}
                </div>
                <div>
                  <span className="text-gray-600">
                    $ {calculateUnitPrice(item.subtotal, item.quantity)} x {item.quantity}份
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsTooltip;
