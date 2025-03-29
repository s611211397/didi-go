'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CreateRestaurantParams } from '@/type/restaurant';

/**
 * 新增餐廳頁面
 */
export default function CreateRestaurantPage() {
  const router = useRouter();
  const { currentUser: user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 表單狀態
  const [formData, setFormData] = useState<CreateRestaurantParams>({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: '',
      notes: ''
    },
    contact: {
      phone: '',
      email: '',
      contactPerson: ''
    },
    minimumOrder: 0,
    notes: '',
    tags: []
  });
  
  // 表單錯誤狀態
  const [errors, setErrors] = useState<{
    name?: string;
    'address.street'?: string;
  }>({});
  
  // 標籤輸入狀態
  const [tagInput, setTagInput] = useState('');
  
  // 處理表單輸入變更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 處理巢狀屬性 (如 address.street)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((prev[parent as keyof CreateRestaurantParams] as object) || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // 清除該欄位的錯誤
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof errors];
        return newErrors;
      });
    }
  };
  
  // 處理標籤的新增
  const handleAddTag = () => {
    if (tagInput.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()]
    }));
    
    setTagInput('');
  };
  
  // 處理標籤的刪除
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };
  
  // 表單驗證
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '請輸入餐廳名稱';
    }
    
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = '請輸入餐廳地址';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: 實際實作會呼叫 restaurant service 將資料存入 Firebase
      console.log('提交餐廳資料:', formData);
      
      // 模擬API延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 成功後導航到餐廳列表頁
      router.push('/restaurants');
    } catch (error) {
      console.error('新增餐廳失敗:', error);
      alert('新增餐廳失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 檢查用戶是否已登入
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
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#484848]">新增餐廳</h1>
            <Link href="/restaurants">
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
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* 基本資訊區塊 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#484848] mb-4">基本資訊</h2>
            
            <div className="space-y-6">
              <Input
                label="餐廳名稱"
                id="name"
                name="name"
                placeholder="請輸入餐廳名稱"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                className=""
                required
              />
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  餐廳描述
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="餐廳簡介、特色或其他描述"
                  className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="minimumOrder" className="block text-sm font-medium text-gray-700 mb-1">
                  最低訂購金額 (可選)
                </label>
                <input
                  type="number"
                  id="minimumOrder"
                  name="minimumOrder"
                  placeholder="0"
                  className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  min="0"
                  value={formData.minimumOrder || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          {/* 地址區塊 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#484848] mb-4">餐廳地址</h2>
            
            <div className="space-y-6">
              <Input
                label="地址"
                id="street"
                name="address.street"
                placeholder="請輸入詳細地址"
                value={formData.address.street}
                onChange={handleChange}
                error={errors['address.street']}
                className=""
                required
              />
            </div>
          </div>
          
          {/* 聯絡資訊區塊 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#484848] mb-4">聯絡資訊</h2>
            
            <div className="space-y-6">
              <Input
                label="聯絡電話"
                id="phone"
                name="contact.phone"
                placeholder="請輸入餐廳電話"
                value={formData.contact.phone}
                onChange={handleChange}
                className=""
              />
            </div>
          </div>
          
          {/* 其他資訊區塊 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#484848] mb-4">其他資訊</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  備註事項 (可選)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="其他額外資訊或備註"
                  className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  標籤 (可選)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag, index) => (
                    <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-green-600 hover:text-green-800"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <Input
                    id="tagInput"
                    name="tagInput"
                    placeholder="輸入標籤，例如：便當、小吃"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-2"
                    onClick={handleAddTag}
                  >
                    新增
                  </Button>
                </div>
                <p className="mt-1 text-sm text-gray-500">可新增多個標籤，例如：便當、小吃、中式料理等</p>
              </div>
            </div>
          </div>
          
          {/* 按鈕區塊 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link href="/restaurants">
              <Button 
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
              >
                取消
              </Button>
            </Link>
            
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? '處理中...' : '新增餐廳'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}