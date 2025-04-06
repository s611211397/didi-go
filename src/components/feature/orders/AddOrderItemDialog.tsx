'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Dialog from '@/components/ui/dialog/Dialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { MenuItem } from '@/type/restaurant';
import { CreateOrderItemParams } from '@/type/order';
import { useAuth } from '@/hooks/useAuth';
import { getMenuItems } from '@/services/menu';
import { createOrderItem } from '@/services/order';

interface AddOrderItemDialogProps {
  show: boolean;
  onClose: () => void;
  orderId: string;
  restaurantId: string;
  onItemAdded: () => void;
}

// 用於分類標籤的介面
interface Category {
  id: string;
  name: string;
}

/**
 * 新增訂單項目彈出視窗
 * 
 * 提供選擇訂購人、商品和數量的介面
 */
const AddOrderItemDialog: React.FC<AddOrderItemDialogProps> = ({
  show,
  onClose,
  orderId,
  restaurantId,
  onItemAdded,
}) => {
  // 身份驗證
  const { currentUser, userProfile } = useAuth();
  
  // 表單狀態
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [customUserName, setCustomUserName] = useState<string>('');
  const [showCustomUserField, setShowCustomUserField] = useState<boolean>(false);
  
  // 數據狀態
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  
  // 初始化表單狀態
  useEffect(() => {
    if (show && currentUser) {
      setUserId(currentUser.uid);
      setUserName(userProfile?.displayName || currentUser.displayName || '');
      setCustomUserName('');
      setShowCustomUserField(false);
      setItemQuantities({});
      setActiveCategory('all');
      setError('');
    }
  }, [show, currentUser, userProfile]);
  
  // 獲取餐廳菜單項目
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (show && restaurantId) {
        try {
          setIsLoading(true);
          setError('');
          
          // 從菜單項目集合中獲取該餐廳的商品
          const items = await getMenuItems(restaurantId);
          const availableItems = items.filter(item => item.isAvailable);
          
          setMenuItems(availableItems);
          
          if (availableItems.length === 0) {
            setError(`此餐廳尚未設定菜單項目，請先在餐廳管理頁面新增菜單項目`);
          }
          
          setIsLoading(false);
        } catch (err) {
          console.error('獲取菜單項目失敗:', err);
          setError('無法獲取菜單項目，請稍後再試');
          setIsLoading(false);
        }
      } else if (show) {
        // 如果沒有餐廳ID但彈窗已顯示
        setError('無法識別餐廳資訊，請回到訂單列表重新操作');
      }
    };
    
    fetchMenuItems();
  }, [show, restaurantId]);
  
  // 從菜單項目中提取分類
  const categories = useMemo<Category[]>(() => {
    // 創建一個集合來存儲唯一的分類ID
    const categoryMap = new Map<string, Category>();
    
    // 添加「全部」分類
    categoryMap.set('all', { id: 'all', name: '全部' });
    
    // 從菜單項目中提取分類
    menuItems.forEach(item => {
      if (item.categoryId && !categoryMap.has(item.categoryId)) {
        // 這裡假設分類名稱未知，使用「分類 X」作為預設名稱
        // 實際應用中，應該從資料庫獲取分類名稱
        categoryMap.set(item.categoryId, { 
          id: item.categoryId, 
          name: `分類 ${categoryMap.size}` 
        });
      }
    });
    
    // 如果沒有分類，添加一個默認分類
    if (categoryMap.size === 1) {
      categoryMap.set('default', { id: 'default', name: '菜單' });
    }
    
    return Array.from(categoryMap.values());
  }, [menuItems]);
  
  // 過濾顯示的菜單項目
  const filteredMenuItems = useMemo(() => {
    if (activeCategory === 'all') {
      return menuItems;
    }
    return menuItems.filter(item => item.categoryId === activeCategory);
  }, [menuItems, activeCategory]);
  
  // 處理數量變更
  const handleQuantityChange = (itemId: string, delta: number) => {
    setItemQuantities(prev => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      return { ...prev, [itemId]: newQuantity };
    });
  };
  
  // 獲取商品數量
  const getItemQuantity = (itemId: string): number => {
    return itemQuantities[itemId] || 0;
  };
  
  // 處理用戶選擇
  const handleUserChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomUserField(true);
      setUserId('custom');
    } else {
      setShowCustomUserField(false);
      setUserId(value);
      setUserName(userProfile?.displayName || currentUser?.displayName || '');
    }
  };
  
  // 處理加入商品
  const handleAddItem = async (item: MenuItem) => {
    // 驗證
    if (userId === 'custom' && !customUserName.trim()) {
      setError('請輸入訂購人名稱');
      return;
    }
    
    const itemQuantity = getItemQuantity(item.id);
    if (itemQuantity <= 0) {
      setError('數量必須大於 0');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 準備訂單項目資料
      const orderItemParams: CreateOrderItemParams = {
        menuItemId: item.id,
        menuItemName: item.name,
        quantity: itemQuantity,
        unitPrice: item.price,
        options: [],
        specialRequests: '',
      };
      
      // 創建訂單項目
      await createOrderItem(
        orderId,
        orderItemParams,
        userId === 'custom' ? 'custom' : userId,
        userId === 'custom' ? customUserName : userName
      );
      
      // 重置該商品的數量
      setItemQuantities(prev => ({
        ...prev,
        [item.id]: 0
      }));
      
      setIsLoading(false);
      onItemAdded();
    } catch (err) {
      console.error('新增訂單項目失敗:', err);
      setError('新增訂單項目失敗，請稍後再試');
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog
      show={show}
      title="新增商品"
      onClose={onClose}
      width="md"
      showFooter={false}
    >
      {/* 錯誤訊息 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* 表單內容 */}
      <div className="space-y-4">
        {/* 訂購人選擇 */}
        <div>
          <Select
            label="訂購人"
            placeholder="請選擇訂購人"
            options={[
              { value: currentUser?.uid || '', label: userProfile?.displayName || currentUser?.displayName || '我自己' },
              { value: 'custom', label: '其他人員' }
            ]}
            value={userId}
            onChange={handleUserChange}
            disabled={isLoading}
          />
        </div>
        
        {/* 自訂訂購人名稱 */}
        {showCustomUserField && (
          <div>
            <Input
              label="訂購人名稱"
              placeholder="請輸入訂購人名稱"
              value={customUserName}
              onChange={(e) => setCustomUserName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}
        
        {/* 分類標籤 */}
        <div className="mt-4">
          <div className="flex overflow-x-auto py-2 space-x-2 mb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${activeCategory === category.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 商品列表 */}
        <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map(item => (
              <div key={item.id} className="p-3 flex items-center justify-between">
                {/* 商品名稱 */}
                <div className="flex-shrink-0 min-w-[120px] max-w-[160px]">
                  <span className="font-medium text-gray-900 truncate block">{item.name}</span>
                </div>
                
                {/* 價格 */}
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="text-gray-600">NT$ {item.price}</span>
                </div>
                
                {/* 數量控制 */}
                <div className="flex items-center">
                  <button 
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                    disabled={getItemQuantity(item.id) <= 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>

                  <span className="mx-2 w-6 text-center text-sm">{getItemQuantity(item.id)}</span>

                  <button 
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                {/* 加入按鈕 */}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="px-2 py-1 text-xs"
                  onClick={() => handleAddItem(item)}
                  disabled={getItemQuantity(item.id) <= 0 || isLoading}
                >
                  加入
                </Button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              {isLoading ? '載入商品中...' : '此分類沒有可用的商品'}
            </div>
          )}
        </div>
        
        {/* 底部按鈕 */}
        <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            關閉
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddOrderItemDialog;