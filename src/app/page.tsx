'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// 引入分離出來的元件
import FeatureCard from '@/components/ui/FeatureCard';
import { AddOrderIcon, OrderHistoryIcon, RestaurantIcon } from '@/components/ui/icons';
import MobileNavBar from '@/components/layout/MobileNavBar';

// 首頁元件
export default function HomePage() {
  const { currentUser: user, userProfile, loading } = useAuth();
  const router = useRouter();
  
  // 檢查用戶是否已登入
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 如果正在載入，顯示載入狀態
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="text-[#10B981] text-xl">載入中...</div>
      </div>
    );
  }

  // 如果用戶未登入，不顯示內容（會被導向登入頁）
  if (!user) {
    return null;
  }

  // 從用戶資料或當前用戶中獲取顯示名稱
  const displayName = userProfile?.displayName || user.displayName || '使用者';

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 頂部導航區域 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#484848]">DiDi GO</h1>
          <div className="flex items-center gap-4">
            <span className="text-[#767676]">Hi, {displayName}</span>
            {/* 用戶頭像 */}
            <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center">
              {displayName[0].toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8"> {/* 添加底部內邊距，避免在手機版被底部導航遮擋 */}
        <h2 className="text-xl font-semibold text-[#484848] mb-6">今天想做什麼？</h2>
        
        {/* 功能卡片區域 - 響應式網格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            title="新增訂單" 
            description="建立新的訂單" 
            icon={<AddOrderIcon />} 
            linkTo="/orders/create" 
            color="border-[#10B981]"
          />
          
          <FeatureCard 
            title="訂單歷史" 
            description="查看過去的訂餐記錄與詳情" 
            icon={<OrderHistoryIcon />} 
            linkTo="/orders/history" 
            color="border-[#3B82F6]"
          />
          
          <FeatureCard 
            title="餐廳管理" 
            description="管理訂餐餐廳與菜單內容" 
            icon={<RestaurantIcon />} 
            linkTo="/restaurants" 
            color="border-[#FFB400]"
          />
        </div>
        
        {/* 最近訂單區域 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-[#484848] mb-6">最近的訂單</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-[#767676]">目前沒有進行中的訂單</p>
            <Link href="/orders/create">
              <button className="mt-4 bg-[#10B981] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all duration-300">
                立即建立訂單
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 底部導航區域 (手機版) */}
      <MobileNavBar />
    </div>
  );
}
