'use client';

import React, { ReactNode, useEffect } from 'react';
import Button from '@/components/ui/Button';

export interface DialogProps {
  /** 是否顯示對話框 */
  show: boolean;
  /** 對話框標題 */
  title: string;
  /** 對話框內容 */
  children: ReactNode;
  /** 主要動作按鈕文字，如不提供則不顯示 */
  primaryButtonText?: string;
  /** 主要動作按鈕點擊事件 */
  onPrimaryButtonClick?: () => void;
  /** 次要動作按鈕文字，如不提供則不顯示 */
  secondaryButtonText?: string;
  /** 次要動作按鈕點擊事件 */
  onSecondaryButtonClick?: () => void;
  /** 關閉對話框的回調 */
  onClose: () => void;
  /** 對話框寬度 */
  width?: 'sm' | 'md' | 'lg' | 'full';
  /** 是否顯示底部按鈕區域 */
  showFooter?: boolean;
}

/**
 * 通用對話框元件
 * 
 * 提供基本對話框功能，支援自訂內容、按鈕和回調
 */
const Dialog: React.FC<DialogProps> = ({
  show,
  title,
  children,
  primaryButtonText,
  onPrimaryButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
  onClose,
  width = 'md',
  showFooter = true,
}) => {
  // 當對話框顯示時，禁止背景滾動
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show) return null;

  // 對話框寬度對應的 class
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full w-full mx-4',
  };

  // 處理背景點擊
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 防止事件冒泡
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-lg shadow-lg flex flex-col w-full ${widthClasses[width]} max-h-[90vh] overflow-hidden`}
        onClick={stopPropagation}
      >
        {/* 標題區域 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
            aria-label="關閉"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 內容區域 */}
        <div className="flex-1 p-4 overflow-y-auto">
          {children}
        </div>
        
        {/* 底部按鈕區域 */}
        {showFooter && (
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
            {secondaryButtonText && (
              <Button
                type="button"
                variant="secondary"
                onClick={onSecondaryButtonClick || onClose}
              >
                {secondaryButtonText}
              </Button>
            )}
            
            {primaryButtonText && (
              <Button
                type="button"
                variant="primary"
                onClick={onPrimaryButtonClick}
              >
                {primaryButtonText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;