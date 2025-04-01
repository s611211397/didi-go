'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DateTimePicker from '@/components/ui/DateTimePicker';
import MobileNavBar from '@/components/layout/MobileNavBar';
import Link from 'next/link';

// 類型定義
interface OrderFormData {
  title: string;
  restaurantId: string;
  deadlineTime: Date;
  deliveryTime: Date;
  note: string;
}

interface Restaurant {
  id: string;
  name: string;
  category: string;
  description?: string;
}

// 模擬餐廳資料，實際應從Firebase獲取
const mockRestaurants: Restaurant[] = [
  { id: '1', name: '大同便當', category: '便當', description: '各式便當、快速送達' },
  { id: '2', name: '好食食堂', category: '便當', description: '健康餐盒、多樣選擇' },
  { id: '3', name: '街角咖啡', category: '咖啡', description: '精緻咖啡、簡餐供應' },
  { id: '4', name: '山丘麵館', category: '麵食', description: '各式麵食、湯品' },
  { id: '5', name: '綠野沙拉', category: '健康餐', description: '新鮮沙拉、輕食' },
];

// 頁面元件
const CreateOrderPage: React.FC = () => {
  const { currentUser: user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [restaurants] = useState<Restaurant[]>(mockRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(mockRestaurants);

  // 表單處理
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<OrderFormData>({
    defaultValues: {
      title: '',
      restaurantId: '',
      deadlineTime: new Date(Date.now() + 60 * 60 * 1000), // 預設1小時後
      deliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 預設2小時後
      note: ''
    }
  });

  // 監聽選中的餐廳ID
  const selectedRestaurantId = watch('restaurantId');

  // 檢查用戶是否已登入
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 從餐廳資料中提取唯一的類別
  useEffect(() => {
    const uniqueCategories = Array.from(new Set(restaurants.map(r => r.category)));
    setCategories(['全部', ...uniqueCategories]);
  }, [restaurants]);

  // 根據所選類別過濾餐廳
  useEffect(() => {
    if (selectedCategory === '全部') {
      setFilteredRestaurants(restaurants);
    } else {
      setFilteredRestaurants(restaurants.filter(r => r.category === selectedCategory));
    }
  }, [selectedCategory, restaurants]);

  // 提交表單處理
  const onSubmit = async (data: OrderFormData) => {
    try {
      console.log('提交的訂單資料:', data);
      // 這裡應該調用Firebase服務存儲訂單資料
      // 成功後導航到訂單詳情頁面
      router.push('/orders');
    } catch (error) {
      console.error('建立訂單失敗:', error);
      // 這裡應有錯誤處理
    }
  };

  // 如果正在載入，返回空
  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 頂部導航區域 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="mr-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-[#484848]">新增訂單</h1>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 訂單標題 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-[#484848] text-lg font-medium mb-2">訂單標題</label>
            <input
              type="text"
              className={`w-full p-3 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="例如：今日午餐大同便當"
              {...register('title', { required: '請輸入訂單標題' })}
            />
            {errors.title && <p className="mt-1 text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          {/* 餐廳選擇 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-[#484848] text-lg font-medium mb-2">選擇餐廳</label>
            
            {/* 類別標籤 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedCategory === category
                      ? 'bg-[#10B981] text-white'
                      : 'bg-gray-200 text-[#484848] hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* 餐廳卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedRestaurantId === restaurant.id
                      ? 'border-[#10B981] bg-green-50'
                      : 'border-gray-200 hover:border-[#10B981]'
                  }`}
                  onClick={() => setValue('restaurantId', restaurant.id)}
                >
                  <h3 className="text-[#484848] font-medium">{restaurant.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-[#767676]">
                      {restaurant.category}
                    </span>
                  </div>
                  {restaurant.description && (
                    <p className="text-[#767676] text-sm mt-2">{restaurant.description}</p>
                  )}
                </div>
              ))}
            </div>
            {errors.restaurantId && <p className="mt-2 text-red-500 text-sm">{errors.restaurantId.message}</p>}
            {filteredRestaurants.length === 0 && (
              <p className="text-[#767676] text-center py-4">沒有符合所選類別的餐廳</p>
            )}
          </div>

          {/* 時間設定 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:gap-6">
              <div className="flex-1 mb-4 md:mb-0">
                <label className="block text-[#484848] text-lg font-medium mb-2">訂單截止時間</label>
                <Controller
                  control={control}
                  name="deadlineTime"
                  rules={{ required: '請選擇截止時間' }}
                  render={({ field }) => (
                    <DateTimePicker
                      selectedDate={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    />
                  )}
                />
                {errors.deadlineTime && <p className="mt-1 text-red-500 text-sm">{errors.deadlineTime.message}</p>}
              </div>
              
              <div className="flex-1">
                <label className="block text-[#484848] text-lg font-medium mb-2">預計送達時間</label>
                <Controller
                  control={control}
                  name="deliveryTime"
                  rules={{ required: '請選擇預計送達時間' }}
                  render={({ field }) => (
                    <DateTimePicker
                      selectedDate={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    />
                  )}
                />
                {errors.deliveryTime && <p className="mt-1 text-red-500 text-sm">{errors.deliveryTime.message}</p>}
              </div>
            </div>
          </div>

          {/* 備註 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-[#484848] text-lg font-medium mb-2">備註 (選填)</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md min-h-[100px]"
              placeholder="如有特殊需求，請在此說明"
              {...register('note')}
            ></textarea>
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#10B981] text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-all duration-300 font-medium"
            >
              建立訂單
            </button>
          </div>
        </form>
      </div>

      {/* 底部導航區域 (手機版) */}
      <MobileNavBar />
    </div>
  );
};

export default CreateOrderPage;
