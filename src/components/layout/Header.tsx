'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

/**
 * 頂部導航欄組件
 * 顯示應用標題和用戶資訊
 */
const Header: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  
  // 如果用戶未登入，不顯示用戶資訊部分
  if (!currentUser) {
    return (
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#484848]">
              DiDi GO
            </Link>
          </div>
          <div>
            <Link href="/login" className="text-[#10B981] hover:underline">
              登入
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 從用戶資料或當前用戶中獲取顯示名稱
  const displayName = userProfile?.displayName || currentUser.displayName || '使用者';
  
  // 獲取用戶頭像首字母
  const avatarInitial = displayName[0].toUpperCase();
  
  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-[#484848] mr-6">
            DiDi GO
          </Link>
          
          {/* 導航連結 - 只在中等及以上屏幕顯示 */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/orders/create" className="flex items-center text-[#484848] hover:text-[#10B981] transition-colors">
              <span className="w-5 h-5 mr-1 text-[#10B981]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </span>
              新增訂單
            </Link>
            
            <Link href="/orders/history" className="flex items-center text-[#484848] hover:text-[#3B82F6] transition-colors">
              <span className="w-5 h-5 mr-1 text-[#3B82F6]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              訂單歷史
            </Link>
            
            <Link href="/restaurants" className="flex items-center text-[#484848] hover:text-[#FFB400] transition-colors">
              <span className="w-5 h-5 mr-1 text-[#FFB400]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </span>
              餐廳管理
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-[#767676]">Hi, {displayName}</span>
          {/* 用戶頭像 */}
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center">
            {avatarInitial}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
