'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Restaurant } from '@/type/restaurant';
import { Timestamp } from '@/type/common';

// 模擬 Timestamp 物件
const createTimestamp = (): Timestamp => ({
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0,
  toDate: () => new Date(),
  toMillis: () => Date.now()
});

// 模擬餐廳資料 - 在實際應用中，這些資料應從Firebase獲取
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: '大同便當',
    description: '提供多種中式便當選擇，價格實惠',
    address: {
      street: '台北市大同區承德路一段32號',
      city: '台北市',
      district: '大同區',
      postalCode: '103'
    },
    contact: {
      phone: '02-2552-5252',
      email: 'contact@datong.com'
    },
    isActive: true,
    createdBy: 'user1',
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
    tags: ['便當', '中式料理']
  },
  {
    id: '2',
    name: '鼎泰豐',
    description: '享譽國際的台灣小籠包餐廳',
    address: {
      street: '台北市信義區松高路68號',
      city: '台北市',
      district: '信義區',
      postalCode: '110'
    },
    contact: {
      phone: '02-8101-8686',
      email: 'service@dintaifung.com'
    },
    isActive: true,
    createdBy: 'user1',
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
    tags: ['小籠包', '台灣料理', '上海菜']
  }
];

/**
 * 餐廳卡片元件
 */
interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-[#E5E7EB]">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-[#484848] mb-2">{restaurant.name}</h3>
            <p className="text-[#767676] mb-4">{restaurant.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#767676] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-[#767676]">
                  {restaurant.address.street}, {restaurant.address.city}
                </span>
              </div>
              
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#767676] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span className="text-[#767676]">{restaurant.contact.phone}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.tags?.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-[#F7F7F7] text-[#767676] text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* 餐廳狀態標籤 */}
          <div className={`px-3 py-1 rounded-full text-sm ${
            restaurant.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {restaurant.isActive ? '營業中' : '未營業'}
          </div>
        </div>
        
        {/* 操作按鈕 */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Link 
            href={`/restaurants/${restaurant.id}/menu`}
            className="inline-flex items-center justify-center px-4 py-2 border border-[#3B82F6] text-[#3B82F6] bg-white rounded-md hover:bg-[#3B82F6] hover:text-white transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            管理菜單
          </Link>
          
          <Link 
            href={`/restaurants/${restaurant.id}`}
            className="inline-flex items-center justify-center px-4 py-2 border border-[#E5E7EB] text-[#767676] bg-white rounded-md hover:bg-[#E5E7EB] transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            編輯資訊
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * 餐廳管理頁面
 */
export default function RestaurantsPage() {
  const { currentUser: user, loading } = useAuth();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  
  // 模擬從Firebase獲取餐廳資料
  useEffect(() => {
    // 實際應用中應從Firebase獲取
    setRestaurants(mockRestaurants);
  }, []);
  
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

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 頂部導航區域 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#484848]">餐廳管理</h1>
            <Link href="/">
              <button className="text-[#767676] hover:text-[#484848]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8"> {/* 添加底部內邊距，避免在手機版被底部導航遮擋 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#484848]">餐廳列表</h2>
            <p className="text-[#767676] mt-1">管理您的訂餐餐廳和菜單</p>
          </div>
          
          <Link href="/restaurants/create">
            <button className="bg-[#10B981] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all duration-300 flex items-center cursor-pointer">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              新增餐廳
            </button>
          </Link>
        </div>
        
        {/* 餐廳列表區域 */}
        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-[#FFB400] text-5xl mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#484848] mb-2">尚未新增餐廳</h3>
            <p className="text-[#767676] mb-6">開始新增您常用的餐廳，以便建立訂餐表單</p>
            <Link href="/restaurants/create">
              <button className="bg-[#10B981] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all duration-300 cursor-pointer">
                立即新增餐廳
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}