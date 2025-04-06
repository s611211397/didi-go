'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Dialog from '@/components/ui/dialog/Dialog';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { MenuItem } from '@/type/restaurant';
import { CreateOrderItemParams } from '@/type/order';
import { useAuth } from '@/hooks/useAuth';
import { getMenuItems } from '@/services/menu';
import { createOrderItem } from '@/services/order';

// 專為這個對話框創建的滑動開關組件
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`block w-10 h-6 rounded-full ${checked ? 'bg-green-500' : 'bg-gray-300'} ${disabled ? 'opacity-50' : ''}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${checked ? 'transform translate-x-4' : ''} ${disabled ? 'opacity-80' : ''}`}></div>
      </div>
      {label && <span className="ml-3 text-gray-700">{label}</span>}
    </label>
  );
};

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
  const [isCustomUser, setIsCustomUser] = useState<boolean>(false);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  
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
      setIsCustomUser(false);
      setItemQuantities({});
      setItemNotes({});
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
    const tagSet = new Set<string>();
    
    menuItems.forEach(item => {
      // 收集所有的標籤
      if (item.tags && item.tags.length > 0) {
        item.tags.forEach(tag => tagSet.add(tag));
      }
      
      // 如果有分類 ID，也收集
      if (item.categoryId && !categoryMap.has(item.categoryId)) {
        categoryMap.set(item.categoryId, { 
          id: item.categoryId, 
          name: `分類 ${categoryMap.size}` 
        });
      }
    });
    
    // 將標籤也加入分類中
    tagSet.forEach(tag => {
      if (!categoryMap.has(tag)) {
        categoryMap.set(tag, { id: tag, name: tag });
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
    
    return menuItems.filter(item => {
      // 檢查分類 ID 是否符合
      if (item.categoryId === activeCategory) {
        return true;
      }
      
      // 檢查標籤是否包含選中的分類
      if (item.tags && item.tags.includes(activeCategory)) {
        return true;
      }
      
      return false;
    });
  }, [menuItems, activeCategory]);
  
  // 處理數量變更
  const handleQuantityChange = (itemId: string, delta: number) => {
    setItemQuantities(prev => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      return { ...prev, [itemId]: newQuantity };
    });
  };
  
  // 處理備註變更
  const handleNoteChange = (itemId: string, note: string) => {
    setItemNotes(prev => ({
      ...prev,
      [itemId]: note
    }));
  };
  
  // 獲取商品數量
  const getItemQuantity = (itemId: string): number => {
    return itemQuantities[itemId] || 0;
  };
  
  // 獲取商品備註
  const getItemNote = (itemId: string): string => {
    return itemNotes[itemId] || '';
  };
  
  // 處理用戶選擇狀態變更
  const handleUserToggleChange = (checked: boolean) => {
    setIsCustomUser(checked);
    if (!checked) {
      // 切換回我自己
      setUserId(currentUser?.uid || '');
      setUserName(userProfile?.displayName || currentUser?.displayName || '');
    } else {
      // 切換為其他人員
      setUserId('custom');
    }
  };
  
  // 處理加入商品
  const handleAddItem = async (item: MenuItem) => {
    // 驗證
    if (isCustomUser && !customUserName.trim()) {
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
        notes: getItemNote(item.id)
      };
      
      // 創建訂單項目
      await createOrderItem(
        orderId,
        orderItemParams,
        isCustomUser ? 'custom' : userId,
        isCustomUser ? customUserName : userName
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
        {/* 訂購人選擇 - 滑動開關 */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">訂購人</label>
            <ToggleSwitch 
              checked={isCustomUser}
              onChange={handleUserToggleChange}
              label={isCustomUser ? '其他人員' : '我自己'}
              disabled={isLoading}
            />
          </div>
          
          {/* 顯示當前用戶名稱 */}
          {!isCustomUser && (
            <div className="mt-2 px-3 py-2 bg-gray-50 rounded-md text-gray-700">
              {userName || '未設定名稱'}
            </div>
          )}

          {/* 自訂訂購人名稱 */}
          {isCustomUser && (
            <div className="mt-2">
              <Input
                placeholder="請輸入訂購人名稱"
                value={customUserName}
                onChange={(e) => setCustomUserName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
        
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
              <div key={item.id} className="p-3 flex flex-col">
                {/* 上層：商品名稱和價格 */}
                <div className="flex items-center justify-between mb-2">
                  {/* 商品名稱 */}
                  <div className="flex-grow">
                    <span className="font-medium text-gray-900 truncate block">{item.name}</span>
                  </div>
                  
                  {/* 價格 */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-gray-600 font-medium">NT${item.price}</span>
                  </div>
                </div>
                
                {/* 下層：備註輸入框 + 數量控制 + 加入按鈕 */}
                <div className="flex items-center gap-2 mt-2">
                  {/* 備註輸入框，左側伸展但保留操作區空間 */}
                  <div className="flex-grow">
                    <Input
                      placeholder="請輸入備註"
                      value={getItemNote(item.id)}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      className="text-sm h-8 w-full"
                    />
                  </div>
                  
                  {/* 數量控制與加入按鈕(分開顯示) */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                      <button 
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                        disabled={getItemQuantity(item.id) <= 0}
                        aria-label="減少數量"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>

                      <span className="px-3 py-1 text-center min-w-8">{getItemQuantity(item.id)}</span>

                      <button 
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                        aria-label="增加數量"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="px-4 py-2 h-8 rounded-md"
                      onClick={() => handleAddItem(item)}
                      disabled={getItemQuantity(item.id) <= 0 || isLoading}
                    >
                      加入
                    </Button>
                  </div>
                </div>
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