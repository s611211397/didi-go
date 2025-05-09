'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * 頂部導航欄組件
 * 顯示應用標題和用戶資訊
 */
const Header: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const pathname = usePathname();

  // 如果當前是登入頁面，不顯示「登入」按鈕
  const isLoginPage = pathname === '/login';
  
  // 檢查當前路徑是否匹配指定的路徑模式
  const isActivePath = (path: string): boolean => {
    if (path === '/orders/create') {
      return pathname === path || pathname.startsWith('/orders/create/');
    } else if (path === '/orders/history') {
      return pathname === path || pathname.startsWith('/orders/history/');
    } else if (path === '/restaurants') {
      return pathname === path || pathname.startsWith('/restaurants/');
    }
    return false;
  };
  
  // 如果用戶未登入，不顯示用戶資訊部分
  if (!currentUser) {
    return (
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#484848]">
              Din GO
            </Link>
          </div>
          {!isLoginPage && (
            <div>
              <Link href="/login" className="text-[#10B981] hover:underline">
                登入
              </Link>
            </div>
          )}
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
            Din GO
          </Link>
          
          {/* 導航連結 - 只在中等及以上屏幕顯示 */}
          <div className="hidden md:flex items-center space-x-6">
            {/* 建立訂單: 在詳情頁面時不導航 */}
            <div 
              onClick={() => {
                // 如果當前在訂單詳情頁面，則不進行導航
                if (!pathname.startsWith('/orders/create/details')) {
                  window.location.href = '/orders/create';
                }
              }}
              className={`flex items-center transition-colors relative py-2 cursor-pointer ${isActivePath('/orders/create') 
                ? 'text-[#10B981] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#10B981]' 
                : 'text-[#484848] hover:text-[#10B981]'}`}
            >
              <span className="w-5 h-5 mr-1 text-[#10B981]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </span>
              建立訂單
            </div>
            
            <Link 
              href="/restaurants" 
              className={`flex items-center transition-colors relative py-2 ${isActivePath('/restaurants') 
                ? 'text-[#FFB400] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#FFB400]' 
                : 'text-[#484848] hover:text-[#FFB400]'}`}
            >
              <span className="w-5 h-5 mr-1 text-[#FFB400]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </span>
              店家管理
            </Link>
            
            <Link 
              href="/orders/history" 
              className={`flex items-center transition-colors relative py-2 ${isActivePath('/orders/history') 
                ? 'text-[#3B82F6] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#3B82F6]' 
                : 'text-[#484848] hover:text-[#3B82F6]'}`}
            >
              <span className="w-5 h-5 mr-1 text-[#3B82F6]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              訂單歷史
            </Link>
          </div>
        </div>
        
        <div className="relative group">
          <div className="flex items-center gap-2 md:gap-4 cursor-pointer">
            <span className="text-[#767676] group-hover:text-[#10B981] transition-colors">Hi, {displayName}</span>
            {/* 用戶頭像 */}
            <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center group-hover:bg-opacity-90 transition-colors">
              {avatarInitial}
            </div>
          </div>
            
          {/* 下拉菜單 - 懸浮顯示 */}
          <div 
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:duration-500 cursor-pointer"
          >
            {/* 選入緩衝區 */}
            <div className="absolute -top-2 left-0 right-0 h-4"></div>
            <button 
              onClick={async () => {
                try {
                  await logout();
                } catch (error) {
                  console.error('登出失敗:', error);
                }
              }}
              className="block w-full text-left px-4 py-2 text-sm text-[#484848] hover:bg-gray-100 hover:text-[#10B981] transition-colors cursor-pointer"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;