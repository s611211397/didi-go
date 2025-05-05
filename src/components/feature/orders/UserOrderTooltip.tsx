'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserOrderTooltipProps } from './types';

/**
 * 用戶訂購提示元件
 * 顯示多個用戶訂購同一商品的詳細資訊
 */
const UserOrderTooltip: React.FC<UserOrderTooltipProps> = ({ item }) => {
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

  // 如果只有一個訂購人，直接顯示名稱
  if (item.userCount === 1) {
    return <div>{item.userNames[0]}</div>;
  }
  
  // 多個訂購人時，使用懸停式提示
  return (
    <>
      <div 
        ref={triggerRef}
        className="cursor-help inline-flex items-center relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="font-medium">{item.userNames[0]}</span>
        <span className="text-sm text-gray-500 ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full">
          +{item.userCount - 1}人
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
                所有訂購人 ({item.userCount} 人合計訂購 {item.quantity} 份)
              </div>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {/* 使用 userOrders 資料結構約和訂購數量 */}
                {Object.entries(
                  // 計算每位使用者的總訂購數量
                  item.userOrders.reduce((acc: Record<string, number>, order) => {
                    acc[order.userName] = (acc[order.userName] || 0) + order.quantity;
                    return acc;
                  }, {})
                )
                .sort((a, b) => b[1] - a[1]) // 按數量降序排列
                .map(([userName, quantity]) => (
                  <li key={userName} className="flex justify-between items-center hover:bg-gray-50 px-1.5 py-1 rounded">
                    <span className="text-gray-700">{userName}</span>
                    <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-full">
                      訂購 {quantity} 份
                    </span>
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

export default UserOrderTooltip;