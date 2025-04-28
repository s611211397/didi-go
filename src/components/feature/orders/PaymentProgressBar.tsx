'use client';

import React from 'react';
import { PaymentProgressBarProps } from './types';

/**
 * 收款進度條元件
 * 顯示訂單收款進度
 */
const PaymentProgressBar: React.FC<PaymentProgressBarProps> = ({ collected, total }) => {
  const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
  
  // 根據百分比選擇對應的寬度類別
  const getWidthClass = (percent: number) => {
    if (percent <= 0) return 'w-0';
    if (percent <= 5) return 'w-1/20';
    if (percent <= 10) return 'w-1/12';
    if (percent <= 15) return 'w-1/8';
    if (percent <= 20) return 'w-1/5';
    if (percent <= 25) return 'w-1/4';
    if (percent <= 30) return 'w-3/10';
    if (percent <= 33) return 'w-1/3';
    if (percent <= 40) return 'w-2/5';
    if (percent <= 45) return 'w-9/20';
    if (percent <= 50) return 'w-1/2';
    if (percent <= 55) return 'w-11/20';
    if (percent <= 60) return 'w-3/5';
    if (percent <= 66) return 'w-2/3';
    if (percent <= 70) return 'w-7/10';
    if (percent <= 75) return 'w-3/4';
    if (percent <= 80) return 'w-4/5';
    if (percent <= 90) return 'w-9/10';
    return 'w-full';
  };
  
  return (
    <div className="w-full">
      {/* 標題列 - 全部依序靠左排列 */}
      <div className="flex flex-wrap items-center space-x-5 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-base font-medium text-gray-700">收款狀態：</span>
          <span className="text-base">
            <span className="font-bold text-green-600">$ {collected}</span>
            <span className={percentage === 100 ? 'text-green-600' : 'text-gray-700'}> / </span>
            <span className={`font-bold ${percentage === 100 ? 'text-green-600' : 'text-red-500'}`}>$ {total}</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-base font-medium text-gray-700">收款進度：</span>
          <span className="text-base bg-green-100 text-green-800 py-0.5 px-2 rounded-full font-medium">{percentage}%</span>
        </div>
      </div>
      
      {/* 進度條 - 與表格同寬 */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`bg-green-500 h-3 rounded-full transition-all duration-500 ease-in-out ${getWidthClass(percentage)}`} 
        ></div>
      </div>
    </div>
  );
};

export default PaymentProgressBar;
