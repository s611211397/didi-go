'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false, 
    isLoading = false, 
    leftIcon, 
    rightIcon, 
    className = '', 
    disabled,
    ...props 
  }, ref) => {
    // 基本按鈕樣式
    const baseStyle = 'flex items-center justify-center rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // 變體樣式
    const variantStyles = {
      primary: 'bg-green-500 hover:bg-green-600 hover:shadow-md text-white focus:ring-green-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 hover:shadow-md text-gray-800 focus:ring-gray-400',
      outline: 'border border-green-500 text-green-500 hover:bg-green-50 focus:ring-green-500',
      danger: 'bg-red-500 hover:bg-red-600 hover:shadow-md text-white focus:ring-red-500',
      text: 'text-green-600 hover:text-green-800 hover:bg-green-50 focus:ring-green-500',
    };
    
    // 尺寸樣式
    const sizeStyles = {
      sm: 'py-1 px-3 text-sm',
      md: 'py-2 px-4 text-base',
      lg: 'py-3 px-6 text-lg',
    };
    
    // 全寬樣式
    const widthStyle = fullWidth ? 'w-full' : '';
    
    // 禁用/載入中狀態
    const stateStyle = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    const buttonClasses = `
      ${baseStyle} 
      ${variantStyles[variant]} 
      ${sizeStyles[size]} 
      ${widthStyle} 
      ${stateStyle} 
      ${className}
    `;
    
    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;