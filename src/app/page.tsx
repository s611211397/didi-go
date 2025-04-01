'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// 引入分離出來的元件
import FeatureCard from '@/components/ui/FeatureCard';
import { AddOrderIcon, OrderHistoryIcon, RestaurantIcon } from '@/components/ui/icons';
import MobileNavBar from '@/components/layout/MobileNavBar';

// 首頁元件
export default function HomePage() {
  const { currentUser: user, loading } = useAuth();
  const router = useRouter();
  
  // 模擬進行中的訂單資料（實際應用中應從服務或 Context 獲取）
  // 只解構狀態值，不需要更新函數
  const [activeOrder] = useState({
    exists: true,
    title: '大同便當訂購',
    id: '123'
  });
  
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

  // 用戶已成功登入，繼續顯示頁面內容

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8"> {/* 添加底部內邊距，避免在手機版被底部導航遮擋 */}
        <div className="flex flex-wrap items-center mb-6">
          <h2 className="text-xl font-semibold text-[#484848]">今天想做什麼？</h2>
          {/* 進行中訂單提示 - 直接接續在標題後面 */}
          {activeOrder.exists && (
            <Link href={`/orders/${activeOrder.id}`} className="ml-3 flex items-center text-[#10B981] text-sm md:text-base">
              <span className="text-[#10B981] mr-1">🟢</span> 
              <span className="hover:underline">訂購中：{activeOrder.title}</span>
            </Link>
          )}
        </div>
        
        {/* 功能卡片區域 - 響應式網格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            title="建立訂單" 
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
        
        {/* 最近訂單區域 - 僅當沒有進行中訂單時顯示 */}
        {!activeOrder.exists && (
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
        )}
      </div>

      {/* 底部導航區域 (手機版) */}
      <MobileNavBar />
    </div>
  );
}
