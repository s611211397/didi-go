'use client';

import React, { ReactNode } from 'react';
import Button from '@/components/ui/Button';

/**
 * 訊息對話框類型
 */
export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

/**
 * 訊息對話框按鈕配置
 */
export interface MessageButton {
  text: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
  onClick?: () => void;
}

/**
 * 訊息對話框屬性
 */
export interface MessageDialogProps {
  /** 是否顯示對話框 */
  show: boolean;
  /** 訊息類型 */
  type?: MessageType;
  /** 標題文字 */
  title?: string;
  /** 訊息內容 */
  message: string | ReactNode;
  /** 主要動作按鈕 */
  primaryButton?: MessageButton;
  /** 次要動作按鈕 */
  secondaryButton?: MessageButton;
  /** 關閉對話框的回調 */
  onClose: () => void;
  /** 是否顯示關閉按鈕 */
  showCloseButton?: boolean;
}

/**
 * 訊息對話框元件
 * 
 * 用於顯示各種類型的訊息，如成功、錯誤、警告和確認等
 */
const MessageDialog: React.FC<MessageDialogProps> = ({
  show,
  type = 'info',
  title,
  message,
  primaryButton,
  secondaryButton,
  onClose,
  showCloseButton = true,
}) => {
  if (!show) return null;

  // 根據類型決定顏色和圖標
  const typeConfig = {
    info: {
      iconColor: 'text-blue-500',
      icon: (
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      title: title || '訊息',
    },
    success: {
      iconColor: 'text-green-500',
      icon: (
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      title: title || '成功',
    },
    warning: {
      iconColor: 'text-yellow-500',
      icon: (
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      ),
      title: title || '警告',
    },
    error: {
      iconColor: 'text-red-500',
      icon: (
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      title: title || '錯誤',
    },
    confirm: {
      iconColor: 'text-blue-500',
      icon: (
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      title: title || '確認',
    },
  };

  // 獲取當前類型的配置
  const currentConfig = typeConfig[type];

  // 默認按鈕設置
  const defaultPrimaryButton: MessageButton = {
    text: type === 'confirm' ? '確認' : '確定',
    variant: type === 'error' ? 'danger' : 'primary',
    onClick: onClose,
  };

  const defaultSecondaryButton: MessageButton = {
    text: '取消',
    variant: 'outline',
    onClick: onClose,
  };

  // 合併自定義按鈕和默認按鈕
  const primaryButtonConfig = { ...defaultPrimaryButton, ...primaryButton };
  const secondaryButtonConfig = secondaryButton ? { ...defaultSecondaryButton, ...secondaryButton } : null;

  // 處理點擊背景關閉
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 只有點擊背景層才會關閉
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-20" 
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        {showCloseButton && (
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="關閉"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
        
        <div className={`${currentConfig.iconColor} text-center mb-4`}>
          {currentConfig.icon}
        </div>
        
        <h3 className="text-xl font-semibold text-[#484848] mb-4 text-center">
          {currentConfig.title}
        </h3>
        
        <div className="text-[#767676] mb-6 text-center">
          {message}
        </div>
        
        <div className="flex justify-end gap-3">
          {secondaryButtonConfig && (
            <Button 
              variant={secondaryButtonConfig.variant}
              onClick={() => {
                if (secondaryButtonConfig.onClick) {
                  secondaryButtonConfig.onClick();
                } else {
                  onClose();
                }
              }}
            >
              {secondaryButtonConfig.text}
            </Button>
          )}
          
          <Button 
            variant={primaryButtonConfig.variant}
            onClick={() => {
              if (primaryButtonConfig.onClick) {
                primaryButtonConfig.onClick();
              } else {
                onClose();
              }
            }}
          >
            {primaryButtonConfig.text}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageDialog;