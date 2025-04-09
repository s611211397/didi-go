'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenuItems } from '@/hooks/useMenuItems';
import { MenuItem, CreateMenuItemParams } from '@/type/restaurant';
import MenuItemCard from '@/components/menu/MenuItemCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { MessageDialog } from '@/components/ui/dialog';

/**
 * 無菜單項目時顯示的空狀態組件
 */
interface EmptyMenuStateProps {
  onAddMenuItem: () => void;
}

const EmptyMenuState: React.FC<EmptyMenuStateProps> = ({ onAddMenuItem }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="text-[#FFB400] text-5xl mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-[#484848] mb-2">尚未新增菜單</h3>
      <p className="text-[#767676] mb-6">開始新增您的菜單項目，以便顯示給顧客</p>
      <Button 
        variant="primary"
        onClick={onAddMenuItem}
      >
        新增第一個菜單項目
      </Button>
    </div>
  );
};

/**
 * 新增/編輯菜單項目的表單界面
 */
interface MenuItemFormProps {
  restaurantId: string;
  menuItem?: MenuItem;
  onClose: () => void;
  onSave: (data: CreateMenuItemParams) => Promise<void>;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ 
  restaurantId, 
  menuItem, 
  onClose, 
  onSave 
}) => {
  // 表單狀態
  const [name, setName] = useState(menuItem?.name || '');
  const [price, setPrice] = useState(menuItem?.price.toString() || '');
  const [description, setDescription] = useState(menuItem?.description || '');
  const [tags, setTags] = useState<string[]>(menuItem?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  
  // 建立輸入框的 refs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  // 為每個輸入框創建專用的鍵盤處理函數
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      priceInputRef.current?.focus();
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tagInputRef.current?.focus();
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      tagInputRef.current?.focus();
    }
  };
  
  // 處理標籤新增
  const handleAddTag = () => {
    if (tagInput.trim() === '') return;
    
    // 按「、」分割輸入，處理多個類別標籤
    const newTags = tagInput
      .split('、')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    if (newTags.length === 0) return;
    
    setTags([...tags, ...newTags]);
    setTagInput('');
  };
  
  // 處理標籤輸入框的鍵盤事件
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 阻止表單提交
      handleAddTag();
    }
  };
  
  // 處理標籤的刪除
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 表單驗證
  const validateForm = (): boolean => {
    const newError = name.trim() === '' ? '請輸入菜單項目名稱' : 
                     isNaN(parseFloat(price)) || parseFloat(price) <= 0 ? '請輸入有效價格' : 
                     null;
    
    if (newError) {
      setError(newError);
      setShowErrorDialog(true);
      return false;
    }
    return true;
  };

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // 準備提交資料
      const formData: CreateMenuItemParams = {
        restaurantId,
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim() || '',  // 使用空字符串而非 undefined
        tags: tags.length > 0 ? tags : undefined,
        isAvailable: true
      };

      await onSave(formData);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存菜單項目失敗';
      setError(errorMessage);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 p-3 pt-[85px]" onClick={onClose}>
      <div className="bg-white rounded-lg px-6 pt-0 pb-5 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-1">
          <button 
            onClick={onClose}
            className="text-[#767676] hover:text-[#484848] cursor-pointer mt-2"
            aria-label="關閉"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* 錯誤訊息對話框 */}
        <MessageDialog
          show={showErrorDialog}
          type="error"
          title="表單驗證錯誤"
          message={error || ''}
          primaryButton={{
            text: "確定",
            variant: "primary",
            onClick: () => setShowErrorDialog(false)
          }}
          onClose={() => setShowErrorDialog(false)}
        />

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Input
              label="名稱"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="輸入菜單項目名稱"
              required
              ref={nameInputRef}
              autoComplete="off"
            />
          </div>

          <div className="mb-3">
            <Input
              label="價格 (NT$)"
              id="price"
              name="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={handlePriceKeyDown}
              placeholder="輸入價格"
              min="0"
              step="1"
              required
              ref={priceInputRef}
              autoComplete="off"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              類別(選填)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-green-600 hover:text-green-800 cursor-pointer text-base font-semibold"
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
                placeholder="輸入，例如：雞肉、牛肉"
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

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備註
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleDescriptionKeyDown}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] text-black"
              placeholder="輸入備註"
              rows={2}
              ref={descriptionInputRef}
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button 
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button 
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              儲存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * 菜單管理頁面
 */
export default function MenuPage() {
  // 路由參數和導航
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const router = useRouter();
  
  // 狀態管理
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  
  // Hooks
  const { currentUser: user, loading: authLoading } = useAuth();
  const { selectedRestaurant, fetchRestaurant } = useRestaurants();
  const { 
    menuItems, 
    fetchMenuItems,
    addMenuItem,
    updateMenuItemInfo,
    removeMenuItem
  } = useMenuItems();
  
  // 從 Firebase 獲取餐廳和菜單資料
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (user && restaurantId && isMounted) {
        try {
          // 獲取餐廳資訊
          await fetchRestaurant(restaurantId);
          
          // 獲取菜單項目
          await fetchMenuItems(restaurantId);
        } catch (error) {
          console.error('獲取資料失敗:', error);
        } finally {
          if (isMounted) {
            setIsInitialLoading(false);
          }
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [user, restaurantId, fetchRestaurant, fetchMenuItems]);
  
  // 檢查用戶是否已登入
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  // 處理菜單項目編輯
  const handleEditMenuItem = (menuItem: MenuItem) => {
    setEditingMenuItem(menuItem);
    setShowForm(true);
  };
  
  // 處理菜單項目儲存
  const handleSaveMenuItem = async (data: CreateMenuItemParams) => {
    if (editingMenuItem) {
      // 更新現有菜單項目
      await updateMenuItemInfo(editingMenuItem.id, data, restaurantId);
    } else {
      // 創建新菜單項目
      await addMenuItem(data);
    }
    
    // 重置表單狀態
    setEditingMenuItem(null);
    setShowForm(false);
    
    // 重新獲取更新後的菜單項目列表
    await fetchMenuItems(restaurantId);
  };
  
  // 處理菜單項目刪除
  const handleDeleteMenuItem = async (menuItemId: string) => {
    await removeMenuItem(menuItemId);
    // 刪除後重新獲取菜單項目
    await fetchMenuItems(restaurantId);
  };
  
  // 如果尚未載入餐廳資訊，返回 null (不顯示任何載入狀態)
  if (isInitialLoading || !selectedRestaurant) {
    return null;
  }
  
  // 顯示菜單項目
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="flex justify-start items-start mb-6">
          <Button 
            variant="primary"
            onClick={() => {
              setEditingMenuItem(null);
              setShowForm(true);
            }}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            }
          >
            新增菜單
          </Button>
          
          <div className="flex-1">
          </div>
        </div>
        
        {/* 顯示菜單項目 */}
        {menuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((menuItem) => (
              <MenuItemCard 
                key={menuItem.id} 
                menuItem={menuItem} 
                onEdit={handleEditMenuItem}
                onDelete={handleDeleteMenuItem}
              />
            ))}
          </div>
        ) : (
          <EmptyMenuState onAddMenuItem={() => {
            setEditingMenuItem(null);
            setShowForm(true);
          }} />
        )}
      </div>
      
      {/* 表單對話框 */}
      {showForm && (
        <MenuItemForm 
          restaurantId={restaurantId}
          menuItem={editingMenuItem || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingMenuItem(null);
          }}
          onSave={handleSaveMenuItem}
        />
      )}
    </div>
  );
}