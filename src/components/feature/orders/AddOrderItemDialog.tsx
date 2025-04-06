'use client';

import React, { useState, useEffect } from 'react';
import Dialog from '@/components/ui/dialog/Dialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { MenuItem } from '@/type/restaurant';
import { CreateOrderItemParams } from '@/type/order';
import { useAuth } from '@/hooks/useAuth';
import { getMenuItem, getMenuItems } from '@/services/menu';
import { createOrderItem } from '@/services/order';

interface AddOrderItemDialogProps {
  show: boolean;
  onClose: () => void;
  orderId: string;
  restaurantId: string;
  onItemAdded: () => void;
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
  const [menuItemId, setMenuItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customUserName, setCustomUserName] = useState<string>('');
  const [showCustomUserField, setShowCustomUserField] = useState<boolean>(false);
  
  // 數據狀態
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // 初始化表單狀態
  useEffect(() => {
    if (show && currentUser) {
      setUserId(currentUser.uid);
      setUserName(userProfile?.displayName || currentUser.displayName || '');
      setQuantity(1);
      setMenuItemId('');
      setCustomUserName('');
      setShowCustomUserField(false);
      setSelectedMenuItem(null);
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
  
  // 獲取選中的菜單項目詳情
  useEffect(() => {
    const fetchMenuItem = async () => {
      if (menuItemId) {
        try {
          const item = await getMenuItem(menuItemId);
          setSelectedMenuItem(item);
        } catch (err) {
          console.error('獲取菜單項目詳情失敗:', err);
        }
      } else {
        setSelectedMenuItem(null);
      }
    };
    
    fetchMenuItem();
  }, [menuItemId]);
  
  // 處理數量變更
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(value);
  };
  
  // 處理菜單項目選擇
  const handleMenuItemChange = (value: string) => {
    setMenuItemId(value);
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
  
  // 處理提交
  const handleSubmit = async () => {
    // 驗證表單
    if (!menuItemId) {
      setError('請選擇商品');
      return;
    }
    
    if (userId === 'custom' && !customUserName.trim()) {
      setError('請輸入訂購人名稱');
      return;
    }
    
    if (quantity <= 0) {
      setError('數量必須大於 0');
      return;
    }
    
    if (!selectedMenuItem) {
      setError('無法獲取商品資訊');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 準備訂單項目資料
      const orderItemParams: CreateOrderItemParams = {
        menuItemId,
        menuItemName: selectedMenuItem.name,
        quantity,
        unitPrice: selectedMenuItem.price,
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
      
      setIsLoading(false);
      onItemAdded();
      onClose();
    } catch (err) {
      console.error('新增訂單項目失敗:', err);
      setError('新增訂單項目失敗，請稍後再試');
      setIsLoading(false);
    }
  };
  
  // 計算小計金額
  const calculateSubtotal = (): number => {
    if (selectedMenuItem) {
      return selectedMenuItem.price * quantity;
    }
    return 0;
  };
  
  return (
    <Dialog
      show={show}
      title="新增商品"
      onClose={onClose}
      primaryButtonText="新增"
      onPrimaryButtonClick={handleSubmit}
      secondaryButtonText="取消"
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
        
        {/* 商品選擇 */}
        <div>
          <Select
            label="選擇商品"
            placeholder="請選擇商品"
            options={menuItems.map(item => ({
              value: item.id,
              label: `${item.name} (NT$ ${item.price})`
            }))}
            value={menuItemId}
            onChange={handleMenuItemChange}
            disabled={isLoading || menuItems.length === 0}
            helpText={menuItems.length === 0 && !error ? '目前沒有可用的商品' : undefined}
          />
        </div>
        
        {/* 數量輸入 */}
        <div>
          <Input
            label="數量"
            type="number"
            min="1"
            value={quantity.toString()}
            onChange={handleQuantityChange}
            disabled={isLoading || !menuItemId}
          />
        </div>
        
        {/* 小計顯示 */}
        {selectedMenuItem && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-medium">單價:</span>
              <span>NT$ {selectedMenuItem.price}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-medium">數量:</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between mt-2 text-lg font-bold">
              <span>小計金額:</span>
              <span>NT$ {calculateSubtotal()}</span>
            </div>
          </div>
        )}
        
        {/* 按鈕區域 */}
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </Button>
          
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!menuItemId || quantity <= 0 || (userId === 'custom' && !customUserName.trim())}
          >
            新增
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddOrderItemDialog;