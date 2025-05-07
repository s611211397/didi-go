'use client';

import React, { useState, useEffect } from 'react';
import { PaymentProgressBarProps } from './types';
import { MessageDialog } from '@/components/ui/dialog';
import { useSearchParams } from 'next/navigation';

/**
 * 收款進度條元件
 * 顯示訂單收款進度，支援響應式設計
 */
const PaymentProgressBar: React.FC<PaymentProgressBarProps> = ({ collected, total }) => {
  const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
  const [showCompletionDialog, setShowCompletionDialog] = useState<boolean>(false);
  
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // 檢查是否從歷史訂單頁面跳轉過來
    const fromHistory = searchParams.get('fromHistory') === 'true';
    
    // 只有在進度為 100% 且不是從歷史訂單頁面跳轉時才顯示完成訊息
    if (percentage === 100 && !fromHistory) {
      setShowCompletionDialog(true);
    }
  }, [percentage, searchParams]);
  
  const handleCloseDialog = () => {
    setShowCompletionDialog(false);
  };
  
  
  return (
    <>
      <div className="w-full">
        {/* 標題區域 - 使用 Flex 布局並在移動端自適應換行 */}
        <div className="flex flex-wrap items-center gap-5 mb-3">
          <div className="flex items-center">
            <span className="text-gray-700 font-medium">收款狀態：</span>
            <span className="ml-2">
              <span className="font-bold text-green-600">$ {collected}</span>
              <span className={percentage === 100 ? 'text-green-600' : 'text-gray-700'}> / </span>
              <span className={`font-bold ${percentage === 100 ? 'text-green-600' : 'text-red-500'}`}>$ {total}</span>
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 font-medium">收款進度：</span>
            <span className="ml-2 bg-green-100 text-green-800 py-0.5 px-2 rounded-full font-medium">{percentage}%</span>
          </div>
        </div>
        
        {/* 進度條 - 不使用內聯樣式，而是基於條件渲染不同寬度的元素 */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          {percentage === 0 && <div className="w-0 bg-green-500 h-3"></div>}
          {percentage > 0 && percentage <= 10 && <div className="w-1/12 bg-green-500 h-3"></div>}
          {percentage > 10 && percentage <= 20 && <div className="w-1/5 bg-green-500 h-3"></div>}
          {percentage > 20 && percentage <= 25 && <div className="w-1/4 bg-green-500 h-3"></div>}
          {percentage > 25 && percentage <= 33 && <div className="w-1/3 bg-green-500 h-3"></div>}
          {percentage > 33 && percentage <= 40 && <div className="w-2/5 bg-green-500 h-3"></div>}
          {percentage > 40 && percentage <= 50 && <div className="w-1/2 bg-green-500 h-3"></div>}
          {percentage > 50 && percentage <= 60 && <div className="w-3/5 bg-green-500 h-3"></div>}
          {percentage > 60 && percentage <= 66 && <div className="w-2/3 bg-green-500 h-3"></div>}
          {percentage > 66 && percentage <= 75 && <div className="w-3/4 bg-green-500 h-3"></div>}
          {percentage > 75 && percentage <= 80 && <div className="w-4/5 bg-green-500 h-3"></div>}
          {percentage > 80 && percentage < 100 && <div className="w-11/12 bg-green-500 h-3"></div>}
          {percentage === 100 && <div className="w-full bg-green-500 h-3"></div>}
        </div>
      </div>
      
      {/* 訂單完成對話框 */}
      <MessageDialog
        show={showCompletionDialog}
        type="success"
        title="訂單完成"
        message="恭喜！所有款項已經成功收齊。訂單已完成。"
        onClose={handleCloseDialog}
        primaryButton={{
          text: '確定',
          onClick: handleCloseDialog
        }}
      />
    </>
  );
};

export default PaymentProgressBar;
