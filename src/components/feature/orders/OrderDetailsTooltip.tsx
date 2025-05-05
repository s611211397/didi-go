'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

  // 引用元素
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // 顯示狀態
  const [isVisible, setIsVisible] = useState(false);
  
  // 確保只在客戶端渲染
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // 更新tooltip和橋樑元素位置
  const updatePositions = () => {
    if (triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // 估算tooltip寬度 (這裡取固定值264px，包含內容寬度和padding)
      const tooltipWidth = 264;
      
      // 設置tooltip位置
      const top = triggerRect.bottom + 4; // 減少間距，使過渡更容易
      const left = Math.min(
        triggerRect.left,
        Math.max(16, viewportWidth - tooltipWidth - 16)
      );
      
      // 設置橋樑元素位置和尺寸
      document.documentElement.style.setProperty('--bridge-width', `${triggerRect.width}px`);
      document.documentElement.style.setProperty('--bridge-top', `${triggerRect.bottom}px`);
      document.documentElement.style.setProperty('--bridge-left', `${triggerRect.left}px`);
      
      // 設置tooltip位置
      document.documentElement.style.setProperty('--tooltip-top', `${top}px`);
      document.documentElement.style.setProperty('--tooltip-left', `${left}px`);
    }
  };
  
  // 處理鼠標進入觸發元素
  const handleMouseEnter = () => {
    updatePositions();
    setIsVisible(true);
  };
  
  // 處理鼠標離開觸發元素
  const handleMouseLeave = () => {
    setIsVisible(false);
  };
  
  // 處理鼠標進入tooltip
  const handleTooltipMouseEnter = () => {
    setIsVisible(true);
  };
  
  // 處理鼠標離開tooltip
  const handleTooltipMouseLeave = () => {
    setIsVisible(false);
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
    <>
      <div 
        ref={triggerRef}
        className="relative cursor-help inline-flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="font-medium">{details[0].menuItemName}</span>
        <span className="text-sm text-gray-500 ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full">
          +{details.length - 1}項
        </span>
        <span className="ml-1 text-blue-500 text-xs">▼</span>
      </div>
      
      {/* 懸停時顯示的提示框 - 使用Portal確保不受表格限制 */}
      {isMounted && isVisible && createPortal(
        <div className="tooltip-container">
          {/* 連接觸發元素和tooltip的不可見橋樑 */}
          <div 
            className="tooltip-bridge"
            onMouseEnter={handleTooltipMouseEnter}
          />
          
          {/* 實際的tooltip */}
          <div 
            className="tooltip-position animate-fade-in"
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div className="w-64 p-3 bg-white border border-gray-200 rounded-md shadow-xl text-sm">
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
        </div>,
        document.body
      )}
    </>
  );
};

export default OrderDetailsTooltip;