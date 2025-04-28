'use client';

import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface TabTooltipProps {
  show: boolean;
  message: string;
  referenceElement: React.RefObject<HTMLElement | null>;
}

/**
 * 頁籤提示元件
 * 顯示在頁籤右側的提示訊息
 */
const TabTooltip: React.FC<TabTooltipProps> = ({ show, message, referenceElement }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  
  // 更新提示位置
  const updatePosition = React.useCallback(() => {
    if (referenceElement.current) {
      const rect = referenceElement.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY + 5,
        left: rect.right + window.scrollX + 10
      });
    }
  }, [referenceElement]);
  
  // 當提示顯示狀態變更時更新位置
  useEffect(() => {
    if (show) {
      updatePosition();
    }
  }, [show, updatePosition]);
  
  // 當位置變更時更新提示元素樣式
  useEffect(() => {
    if (show && tooltipRef.current) {
      tooltipRef.current.style.top = `${position.top}px`;
      tooltipRef.current.style.left = `${position.left}px`;
    }
  }, [show, position]);

  // 如果不顯示提示，則返回 null
  if (!show) return null;
  
  // 使用 Portal 創建提示元素
  return ReactDOM.createPortal(
    <div 
      ref={tooltipRef}
      className="fixed z-[99999] bg-gray-600 bg-opacity-80 text-gray-200 px-3 py-1 rounded shadow-sm pointer-events-none text-xs whitespace-nowrap opacity-100 transition-none"
    >
      {message}
    </div>,
    document.body
  );
};

export default TabTooltip;
