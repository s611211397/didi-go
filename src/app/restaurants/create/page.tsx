'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CreateRestaurantParams } from '@/type/restaurant';
import { useRestaurants } from '@/hooks/useRestaurants'; // 使用餐廳Hook

/**
 * 新增餐廳頁面
 */
export default function CreateRestaurantPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 獲取 URL 查詢參數
  const restaurantId = searchParams.get('id'); // 嘗試獲取 id 參數
  const isEditMode = !!restaurantId; // 判斷是否為編輯模式
  
  const { currentUser: user, loading: authLoading } = useAuth();
  const { addRestaurant, updateRestaurantInfo, fetchRestaurant, error: restaurantError } = useRestaurants();
  
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
  
  // 類別標籤輸入狀態
  const [tagInput, setTagInput] = useState('');
  
  // 建立輸入框的 refs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // 為每個輸入框創建專用的鍵盤處理函數
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addressInputRef.current?.focus();
    }
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      phoneInputRef.current?.focus();
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tagInputRef.current?.focus();
    }
  };

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
  
  // 處理類別標籤的新增
  const handleAddTag = () => {
    if (tagInput.trim() === '') return;
    
    // 按「、」分割輸入，處理多個類別標籤
    const newTags = tagInput
      .split('、')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    if (newTags.length === 0) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), ...newTags]
    }));
    
    setTagInput('');
  };
  
  // 處理類別標籤輸入框的鍵盤事件
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 阻止表單提交
      handleAddTag();
    }
  };
  
  // 處理類別標籤的刪除
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
      newErrors.name = '請輸入店家名稱';
    }
    
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = '請輸入店家地址';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 處理表單提交
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) return; // 確保用戶已登入
    if (isSubmitting) return; // 防止重複提交
    
    setIsSubmitting(true); // 設置提交狀態
    
    try {
      if (isEditMode && restaurantId) {
        // 編輯模式：更新餐廳
        await updateRestaurantInfo(restaurantId, formData, user.uid);
      } else {
        // 新增模式：建立餐廳
        await addRestaurant(formData, user.uid);
      }
      
      // 成功後導航到餐廳列表頁
      router.push('/restaurants');
    } catch (error) {
      console.error(isEditMode ? '更新店家失敗:' : '新增店家失敗:', error);
      // 錯誤已由 hook 內部處理，不需要再顯示提示
      setIsSubmitting(false); // 重設提交狀態
    }
  };
  
  // 從 Firebase 獲取餐廳資料並填充表單（僅在編輯模式下）
  useEffect(() => {
    // 預防無限循環的保護機制
    let isMounted = true;

    const loadRestaurantData = async () => {
      if (isEditMode && restaurantId && user && isMounted) {
        try {
          const restaurantData = await fetchRestaurant(restaurantId);
          if (restaurantData && isMounted) {
            // 填充表單數據
            setFormData({
              name: restaurantData.name || '',
              description: restaurantData.description || '',
              address: {
                street: restaurantData.address?.street || '',
                city: restaurantData.address?.city || '',
                district: restaurantData.address?.district || '',
                postalCode: restaurantData.address?.postalCode || '',
                notes: restaurantData.address?.notes || ''
              },
              contact: {
                phone: restaurantData.contact?.phone || '',
                email: restaurantData.contact?.email || '',
                contactPerson: restaurantData.contact?.contactPerson || ''
              },
              minimumOrder: restaurantData.minimumOrder || 0,
              notes: restaurantData.notes || '',
              tags: restaurantData.tags || []
            });
          }
        } catch (error) {
          console.error('獲取店家資料失敗:', error);
        }
      }
    };

    loadRestaurantData();

    // 清理函數
    return () => {
      isMounted = false;
    };
  }, [isEditMode, restaurantId, user, fetchRestaurant]);

  // 檢查用戶是否已登入
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // 如果用戶未登入，不顯示內容（會被導向登入頁）
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <form className="max-w-3xl mx-auto" onSubmit={(e) => e.preventDefault()}>
          {/* 基本資訊區塊 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#484848] mb-4">基本資訊</h2>
            
            <div className="space-y-6">
              <Input
                label="店家名稱"
                id="name"
                name="name"
                placeholder="請輸入店家名稱"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleNameKeyDown}
                error={errors.name}
                className=""
                required
                ref={nameInputRef}
                autoComplete="off"
              />
              

              


              <Input
                label="地址"
                id="street"
                name="address.street"
                placeholder="請輸入詳細地址"
                value={formData.address.street}
                onChange={handleChange}
                onKeyDown={handleAddressKeyDown}
                error={errors['address.street']}
                className=""
                required
                ref={addressInputRef}
                autoComplete="off"
              />
              
              <Input
                label="聯絡電話"
                id="phone"
                name="contact.phone"
                placeholder="請輸入店家電話"
                value={formData.contact.phone}
                onChange={handleChange}
                onKeyDown={handlePhoneKeyDown}
                className=""
                ref={phoneInputRef}
                autoComplete="off"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  類別 (選填)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag, index) => (
                    <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-green-600 hover:text-green-800 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2 items-center">
                  <Input
                    id="tagInput"
                    name="tagInput"
                    placeholder="輸入類別，例如：便當、小吃"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="flex-1"
                    ref={tagInputRef}
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-shrink-0"
                    onClick={handleAddTag}
                    size="input"
                  >
                    新增
                  </Button>
                </div>
                <p className="mt-1 text-sm text-gray-500">使用「、」分隔，可一次輸入多個類別</p>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  備註事項 (選填)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="其他額外資訊"
                  className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                />
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
              type="button"
              variant="primary"
              className="w-full sm:w-auto"
              isLoading={false}
              onClick={handleSubmit}
            >
              {isEditMode ? '儲存變更' : '新增店家'}
            </Button>
            
            {restaurantError && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md w-full">
                {restaurantError}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}