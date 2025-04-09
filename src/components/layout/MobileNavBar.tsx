'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { AddOrderMobileIcon, OrderHistoryMobileIcon, RestaurantMobileIcon } from '@/components/ui/icons';

/**
 * 手機版底部導航欄組件
 * 只在手機版顯示，提供快速訪問主要功能
 */
const MobileNavBar: React.FC = () => {
  const pathname = usePathname();
  
  // 處理「新增訂購」按鈕點擊
  const handleCreateOrderClick = (e: React.MouseEvent) => {
    // 如果當前已在訂單詳情頁面，則不導航
    if (pathname.startsWith('/orders/create/details')) {
      e.preventDefault();
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-md">
      <div className="flex justify-around items-center p-3">
        <Link 
          href="/orders/create" 
          className="flex flex-col items-center text-[#10B981]"
          onClick={handleCreateOrderClick}
        >
          <AddOrderMobileIcon />
          <span className="text-xs mt-1">新增訂購</span>
        </Link>
        
        <Link href="/orders/history" className="flex flex-col items-center text-[#767676]">
          <OrderHistoryMobileIcon />
          <span className="text-xs mt-1">訂單歷史</span>
        </Link>
        
        <Link href="/restaurants" className="flex flex-col items-center text-[#767676]">
          <RestaurantMobileIcon />
          <span className="text-xs mt-1">餐廳管理</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavBar;
