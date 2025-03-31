import { useState, useCallback } from 'react';
import { MenuItem, CreateMenuItemParams } from '@/type/restaurant';
import { 
  getMenuItems, 
  getMenuItem, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  getMenuItemsByCategory
} from '@/services/menu';

/**
 * 菜單項目 Hook
 * 提供菜單項目相關功能的狀態管理和操作方法
 */
export const useMenuItems = () => {
  // 狀態管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [categorizedMenuItems, setCategorizedMenuItems] = useState<Record<string, MenuItem[]>>({});

  /**
   * 獲取餐廳的菜單項目列表
   * @param restaurantId 餐廳ID
   */
  const fetchMenuItems = useCallback(async (restaurantId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenuItems(restaurantId);
      setMenuItems(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '獲取菜單項目失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 獲取單個菜單項目詳情
   * @param menuItemId 菜單項目ID
   */
  const fetchMenuItem = useCallback(async (menuItemId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenuItem(menuItemId);
      setSelectedMenuItem(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '獲取菜單項目詳情失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 按類別獲取菜單項目
   * @param restaurantId 餐廳ID
   * @param categoryId 類別ID
   */
  const fetchMenuItemsByCategory = useCallback(async (restaurantId: string, categoryId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenuItemsByCategory(restaurantId, categoryId);
      
      // 更新分類菜單狀態
      setCategorizedMenuItems(prev => ({
        ...prev,
        [categoryId]: data
      }));
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '獲取分類菜單項目失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 新增菜單項目
   * @param menuItemData 菜單項目資料
   */
  const addMenuItem = useCallback(async (menuItemData: CreateMenuItemParams) => {
    setLoading(true);
    setError(null);
    try {
      const menuItemId = await createMenuItem(menuItemData);
      
      // 更新本地菜單項目列表
      await fetchMenuItems(menuItemData.restaurantId);
      
      return menuItemId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '新增菜單項目失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMenuItems]);

  /**
   * 更新菜單項目資訊
   * @param menuItemId 菜單項目ID
   * @param menuItemData 更新的菜單項目資料
   * @param restaurantId 餐廳ID 用於更新列表
   */
  const updateMenuItemInfo = useCallback(async (
    menuItemId: string, 
    menuItemData: Partial<CreateMenuItemParams>, 
    restaurantId: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      await updateMenuItem(menuItemId, menuItemData);
      
      // 如果是當前選中的菜單項目，更新詳情
      if (selectedMenuItem && selectedMenuItem.id === menuItemId) {
        await fetchMenuItem(menuItemId);
      }
      
      // 更新本地菜單項目列表
      await fetchMenuItems(restaurantId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新菜單項目失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMenuItem, fetchMenuItems, selectedMenuItem]);

  /**
   * 刪除菜單項目
   * @param menuItemId 菜單項目ID
   */
  const removeMenuItem = useCallback(async (menuItemId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteMenuItem(menuItemId);
      
      // 如果是當前選中的菜單項目，清除選中狀態
      if (selectedMenuItem && selectedMenuItem.id === menuItemId) {
        setSelectedMenuItem(null);
      }
      
      // 從本地列表中移除
      setMenuItems(prevMenuItems => 
        prevMenuItems.filter(menuItem => menuItem.id !== menuItemId)
      );
      
      // 從分類菜單中移除
      setCategorizedMenuItems(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(categoryId => {
          updated[categoryId] = updated[categoryId].filter(
            menuItem => menuItem.id !== menuItemId
          );
        });
        return updated;
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '刪除菜單項目失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedMenuItem]);

  /**
   * 清除錯誤
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * 過濾可用的菜單項目
   */
  const getAvailableMenuItems = useCallback(() => {
    return menuItems.filter(item => item.isAvailable);
  }, [menuItems]);

  /**
   * 過濾熱門菜單項目
   */
  const getPopularMenuItems = useCallback(() => {
    return menuItems.filter(item => item.isPopular && item.isAvailable);
  }, [menuItems]);

  return {
    // 狀態
    loading,
    error,
    menuItems,
    selectedMenuItem,
    categorizedMenuItems,
    
    // 方法
    fetchMenuItems,
    fetchMenuItem,
    fetchMenuItemsByCategory,
    addMenuItem,
    updateMenuItemInfo,
    removeMenuItem,
    clearError,
    getAvailableMenuItems,
    getPopularMenuItems,
    
    // 設置器
    setSelectedMenuItem
  };
};

export default useMenuItems;