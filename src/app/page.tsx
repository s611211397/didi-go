'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserOrders } from '@/services/order';
import { OrderStatus } from '@/type/common';

// 引入分離出來的元件
import FeatureCard from '@/components/ui/FeatureCard';
import { AddOrderIcon, OrderHistoryIcon, RestaurantIcon } from '@/components/ui/icons';
import MobileNavBar from '@/components/layout/MobileNavBar';

// 首頁元件
export default function HomePage() {
  const { currentUser: user, loading } = useAuth();
  const router = useRouter();
  
  // 獲取進行中的訂單資料
  const [activeOrder, setActiveOrder] = useState<{ exists: boolean, title?: string, id?: string }>({ exists: false });
  
  // 獲取用戶的訂購中訂單
  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (!user) return;
      
      try {
        // 從 order 服務獲取用戶訂單
        const orders = await getUserOrders(user.uid);
        // 找出狀態為 ORDERING 的最新訂單
        const activeOrders = orders.filter(order => order.status === OrderStatus.ORDERING);
        
        if (activeOrders.length > 0) {
          // 存在訂購中的訂單，取第一筆（最新）
          const latest = activeOrders[0];
          setActiveOrder({
            exists: true,
            title: latest.title,
            id: latest.id
          });
        } else {
          // 沒有訂購中的訂單
          setActiveOrder({ exists: false });
        }
      } catch (error) {
        console.error('獲取訂購中訂單失敗:', error);
        setActiveOrder({ exists: false });
      }
    };
    
    fetchActiveOrder();
  }, [user]);

  
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
            <Link href={`/orders/create/details?id=${activeOrder.id}&fromHistory=true`} className="ml-3 flex items-center text-[#10B981] text-sm md:text-base">
              <span className="text-[#10B981] mr-1">🟢</span> 
              <span className="hover:underline">訂購中的訂單：{activeOrder.title}</span>
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
            title="店家管理" 
            description="管理店家與菜單" 
            icon={<RestaurantIcon />} 
            linkTo="/restaurants" 
            color="border-[#FFB400]"
          />
          
          <FeatureCard 
            title="訂單歷史" 
            description="查看過去的訂餐記錄與詳情" 
            icon={<OrderHistoryIcon />} 
            linkTo="/orders/history" 
            color="border-[#3B82F6]"
          />
        </div>
      </div>

      {/* 底部導航區域 (手機版) */}
      <MobileNavBar />
    </div>
  );
}
