'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenuItems } from '@/hooks/useMenuItems';
import { MenuItem, CreateMenuItemParams } from '@/type/restaurant';
import MenuItemCard from '@/components/menu/MenuItemCard';
import Button from '@/components/ui/Button';

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

  // 處理標籤新增
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // 處理標籤刪除
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 表單驗證
    if (!name.trim()) {
      setError('請輸入菜單項目名稱');
      setIsSubmitting(false);
      return;
    }

    if (!price.trim() || isNaN(parseFloat(price))) {
      setError('請輸入有效價格');
      setIsSubmitting(false);
      return;
    }

    try {
      // 準備提交資料
      const formData: CreateMenuItemParams = {
        restaurantId,
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        isAvailable: menuItem?.isAvailable ?? true,
        isPopular: menuItem?.isPopular ?? false,
        categoryId: menuItem?.categoryId
      };

      await onSave(formData);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存菜單項目失敗';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#484848]">
            {menuItem ? '編輯菜單項目' : '新增菜單項目'}
          </h3>
          <button 
            onClick={onClose}
            className="text-[#767676] hover:text-[#484848]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#484848] font-medium mb-1">
              名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              placeholder="輸入菜單項目名稱"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[#484848] font-medium mb-1">
              價格 (NT$) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              placeholder="輸入價格"
              min="0"
              step="1"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[#484848] font-medium mb-1">
              備註
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              placeholder="輸入備註"
              rows={3}
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-[#484848] font-medium mb-1">
              標籤
            </label>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                placeholder="輸入標籤"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-[#10B981] text-white rounded-r-md hover:bg-[#0D9668]"
              >
                添加
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <div key={index} className="bg-[#F7F7F7] text-[#767676] text-sm px-2 py-1 rounded-full flex items-center">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-[#767676] hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
              {isSubmitting ? '儲存中...' : '儲存'}
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
    loading: menuLoading, 
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
  
  // 如果尚未載入餐廳資訊，顯示載入中
  if (isInitialLoading || !selectedRestaurant) {
    return null;
  }
  
  // 示範用的三個虛擬菜單項目
  const demoMenuItems: MenuItem[] = [
    {
      id: 'demo-1',
      restaurantId,
      name: '香菇燉雞湯',
      description: '採用新鮮雞肉與香菇燉煮，湯頭鮮甜',
      price: 200,
      isAvailable: true,
      tags: ['湯品', '招牌'],
      createdAt: null,
      updatedAt: null
    },
    {
      id: 'demo-2',
      restaurantId,
      name: '宮保雞丁',
      description: '經典川菜，辣中帶甜',
      price: 180,
      isAvailable: true,
      isPopular: true,
      tags: ['川菜', '辣'],
      createdAt: null,
      updatedAt: null
    },
    {
      id: 'demo-3',
      restaurantId,
      name: '蔬菜沙拉',
      description: '新鮮時蔬佐柚子醋',
      price: 120,
      isAvailable: true,
      tags: ['沙拉', '素食'],
      createdAt: null,
      updatedAt: null
    }
  ];
  
  // 顯示菜單項目，如果尚未有實際項目則顯示示範項目
  const displayedMenuItems = menuItems.length > 0 ? menuItems : demoMenuItems;
  
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 頂部導航區域 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/restaurants">
                <button className="text-[#767676] hover:text-[#484848] mr-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                </button>
              </Link>
              <h1 className="text-2xl font-bold text-[#484848]">菜單管理</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#484848]">
              {selectedRestaurant.name} - 菜單項目
            </h2>
            <p className="text-[#767676] mt-1">
              管理您的菜單項目
            </p>
          </div>
          
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
            新增菜單項目
          </Button>
        </div>
        
        {/* 顯示菜單項目 */}
        {displayedMenuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedMenuItems.map((menuItem) => (
              <MenuItemCard 
                key={menuItem.id} 
                menuItem={menuItem} 
                onEdit={handleEditMenuItem}
                onDelete={handleDeleteMenuItem}
              />
            ))}
          </div>
        ) : menuItems.length === 0 && !menuLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-[#FFB400] text-5xl mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#484848] mb-2">尚未新增菜單</h3>
            <p className="text-[#767676] mb-6">開始新增您的菜單項目，以便顧客查看和訂購</p>
          </div>
        ) : null}
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