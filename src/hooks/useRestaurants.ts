import { useState, useCallback } from 'react';
import { Restaurant, CreateRestaurantParams } from '@/type/restaurant';
import { 
  getRestaurants, 
  getRestaurant, 
  createRestaurant, 
  updateRestaurant, 
  deleteRestaurant 
} from '@/services/restaurant';

/**
 * 餐廳 Hook
 * 提供餐廳相關功能的狀態管理和操作方法
 */
export const useRestaurants = () => {
  // 狀態管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  /**
   * 獲取使用者的餐廳列表
   * @param userId 使用者ID
   */
  const fetchRestaurants = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurants(userId);
      setRestaurants(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '獲取餐廳列表失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 獲取單個餐廳詳情
   * @param restaurantId 餐廳ID
   */
  const fetchRestaurant = useCallback(async (restaurantId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurant(restaurantId);
      setSelectedRestaurant(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '獲取餐廳詳情失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 新增餐廳
   * @param restaurantData 餐廳資料
   * @param userId 使用者ID
   */
  const addRestaurant = useCallback(async (restaurantData: CreateRestaurantParams, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = await createRestaurant(restaurantData, userId);
      
      // 更新本地餐廳列表
      await fetchRestaurants(userId);
      
      return restaurantId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '新增餐廳失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRestaurants]);

  /**
   * 更新餐廳資訊
   * @param restaurantId 餐廳ID
   * @param restaurantData 更新的餐廳資料
   * @param userId 使用者ID
   */
  const updateRestaurantInfo = useCallback(async (
    restaurantId: string, 
    restaurantData: Partial<CreateRestaurantParams>, 
    userId: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      await updateRestaurant(restaurantId, restaurantData);
      
      // 如果是當前選中的餐廳，更新詳情
      if (selectedRestaurant && selectedRestaurant.id === restaurantId) {
        await fetchRestaurant(restaurantId);
      }
      
      // 更新本地餐廳列表
      await fetchRestaurants(userId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新餐廳失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRestaurant, fetchRestaurants, selectedRestaurant]);

  /**
   * 刪除餐廳
   * @param restaurantId 餐廳ID
   */
  const removeRestaurant = useCallback(async (restaurantId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteRestaurant(restaurantId);
      
      // 如果是當前選中的餐廳，清除選中狀態
      if (selectedRestaurant && selectedRestaurant.id === restaurantId) {
        setSelectedRestaurant(null);
      }
      
      // 從本地列表中移除
      setRestaurants(prevRestaurants => 
        prevRestaurants.filter(restaurant => restaurant.id !== restaurantId)
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '刪除餐廳失敗';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  /**
   * 清除錯誤
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 狀態
    loading,
    error,
    restaurants,
    selectedRestaurant,
    
    // 方法
    fetchRestaurants,
    fetchRestaurant,
    addRestaurant,
    updateRestaurantInfo,
    removeRestaurant,
    clearError,
    
    // 設置器
    setSelectedRestaurant
  };
};

export default useRestaurants;