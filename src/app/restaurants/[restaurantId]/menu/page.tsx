'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenuItems } from '@/hooks/useMenuItems';
import { MenuItem, CreateMenuItemParams } from '@/type/restaurant';
import MenuItemCard from '@/components/menu/MenuItemCard';
import Button from '@/components/ui/Button';
import MenuItemForm from '@/components/feature/menu/MenuItemForm';

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