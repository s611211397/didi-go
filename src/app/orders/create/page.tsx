'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DateTimePicker from '@/components/ui/DateTimePicker';
import Button from '@/components/ui/Button';
import MobileNavBar from '@/components/layout/MobileNavBar';
import { getRestaurants } from '@/services/restaurant';
import { createOrder } from '@/services/order';
import { Restaurant } from '@/type/restaurant';
import { CreateOrderParams } from '@/type/order';

// 表單資料介面
interface OrderFormData {
  title: string;
  restaurantId: string;
  deadlineTime: Date;
  deliveryTime: Date;
  note: string;
}

// 頁面元件
const CreateOrderPage: React.FC = () => {
  const { currentUser: user, loading } = useAuth();
  const router = useRouter();
  // 不再使用載入中狀態
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  // 不再需要預先設定按鈕樣式，因為使用Button元件

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

  // 確保組件已掛載，用於解決樣式閃爍問題
  useEffect(() => {
    setMounted(true);
  }, []);

  // 監聽選中的餐廳ID
  const selectedRestaurantId = watch('restaurantId');

  // 從Firebase獲取餐廳列表
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!user) return;
      
      try {
        const fetchedRestaurants = await getRestaurants(user.uid);
        setRestaurants(fetchedRestaurants);
        setFilteredRestaurants(fetchedRestaurants);
      } catch (err) {
        console.error('獲取餐廳列表失敗:', err);
        setError('無法獲取餐廳列表，請稍後再試');
      }
    };

    fetchRestaurants();
  }, [user]);

  // 檢查用戶是否已登入
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 從餐廳資料中提取唯一的類別
  useEffect(() => {
    // 從餐廳的tags屬性中提取唯一類別
    const uniqueTags = new Set<string>();
    
    restaurants.forEach(restaurant => {
      if (restaurant.tags && restaurant.tags.length > 0) {
        restaurant.tags.forEach(tag => uniqueTags.add(tag));
      }
    });
    
    setCategories(['全部', ...Array.from(uniqueTags)]);
  }, [restaurants]);

  // 根據所選類別過濾餐廳
  useEffect(() => {
    if (selectedCategory === '全部') {
      setFilteredRestaurants(restaurants);
    } else {
      setFilteredRestaurants(
        restaurants.filter(restaurant => 
          restaurant.tags && restaurant.tags.includes(selectedCategory)
        )
      );
    }
  }, [selectedCategory, restaurants]);

  // 提交表單處理
  const onSubmit = async (data: OrderFormData) => {
    if (!user) return;
    
    try {
      // 將表單資料轉換為CreateOrderParams格式
      const orderParams: CreateOrderParams = {
        title: data.title,
        description: `從 ${restaurants.find(r => r.id === data.restaurantId)?.name || '餐廳'} 訂購`,
        deadlineTime: data.deadlineTime,
        estimatedDeliveryTime: data.deliveryTime,
        tags: [
          restaurants.find(r => r.id === data.restaurantId)?.name || '餐廳'
        ]
      };
      
      // 只有在備註有內容時才添加到參數中
      if (data.note && data.note.trim() !== '') {
        orderParams.notes = data.note;
      }
      
      // 創建訂單
      const orderId = await createOrder(orderParams, user.uid);
      
      // 導航到訂單明細頁面
      router.push(`/orders/create/details?id=${orderId}`);
    } catch (error) {
      console.error('建立訂單失敗:', error);
      setError('建立訂單失敗，請稍後再試');
    }
  };

  // 如果正在載入用戶資訊，返回空
  if (loading || !user) {
    return null;
  }

  // 如果尚未掛載完成，返回空以避免樣式閃爍
  if (!mounted) {
    return <div className="min-h-screen bg-[#F7F7F7]"></div>;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 顯示錯誤信息 */}
      {error && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        </div>
      )}
      
      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-8">
        
        <form className="space-y-6">
          {/* 所有訂單信息的卡片 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* 訂單標題部分 */}
            <div className="mb-8">
              <label className="block text-[#484848] text-lg font-medium mb-2">訂單標題</label>
              <input
                type="text"
                className={`w-full p-3 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="例如：今日午餐大同便當"
                {...register('title', { required: '請輸入訂單標題' })}
              />
              {errors.title && <p className="mt-1 text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            {/* 時間設定部分 */}
            <div className="flex flex-col md:flex-row md:gap-3 mb-8">
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

            {/* 餐廳選擇部分 */}
            <div className="mb-8">
              <label className="block text-[#484848] text-lg font-medium mb-2">選擇餐廳</label>
              
              {/* 類別標籤 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`px-4 py-2 rounded-full text-sm ${
                      selectedCategory === category
                        ? 'bg-green-500 text-white'
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
                {filteredRestaurants.length > 0 ? (
                  filteredRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedRestaurantId === restaurant.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-500'
                      }`}
                      onClick={() => setValue('restaurantId', restaurant.id)}
                    >
                      <div className="flex items-center gap-1 flex-wrap">
                        <h3 className="text-[#484848] font-medium mr-2">{restaurant.name}</h3>
                        {restaurant.tags && restaurant.tags.map((tag, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-gray-200 rounded-full text-[#767676]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {restaurant.description && (
                        <p className="text-[#767676] text-sm mt-2">{restaurant.description}</p>
                      )}
                      {restaurant.address && (
                        <p className="text-[#767676] text-xs mt-1">{restaurant.address.street}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-8 text-center">
                    <p className="text-[#767676]">沒有符合所選類別的餐廳</p>
                    {categories.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => setSelectedCategory('全部')}
                        className="mt-2 text-green-500 hover:underline"
                      >
                        顯示所有餐廳
                      </button>
                    )}
                    <p className="mt-4 text-sm text-[#767676]">
                      還沒有餐廳？<Link href="/restaurants/create" className="text-green-500 hover:underline">新增餐廳</Link>
                    </p>
                  </div>
                )}
              </div>
              {errors.restaurantId && <p className="mt-2 text-red-500 text-sm">{errors.restaurantId.message}</p>}
            </div>

            {/* 備註部分 */}
            <div>
              <label className="block text-[#484848] text-lg font-medium mb-2">備註 (選填)</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md min-h-[100px]"
                placeholder="如有特殊需求，請在此說明"
                {...register('note')}
              ></textarea>
            </div>
          </div>
        </form>
        
        {/* 建立訂單按鈕 - 固定在畫面右下角 */}
        <div className="fixed bottom-20 right-6 md:bottom-8 md:right-30 z-10">
          <Button 
            type="button" 
            onClick={handleSubmit(onSubmit)}
            variant="primary"
            className="shadow-lg rounded-full px-6 py-3" 
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            }
          >
            建立訂單
          </Button>
        </div>
      </div>
      {/* 底部導航區域 (手機版) */}
      <MobileNavBar />
    </div>
  );
};

export default CreateOrderPage;