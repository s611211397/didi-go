import { db } from '@/lib/firebase';
import { Restaurant, CreateRestaurantParams } from '@/type/restaurant';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

/**
 * 創建新餐廳
 * @param params 餐廳參數
 * @param userId 創建者ID
 */
export const createRestaurant = async (params: CreateRestaurantParams, userId: string): Promise<string> => {
  try {
    const restaurantData = {
      ...params,
      isActive: true,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'restaurants'), restaurantData);
    return docRef.id;
  } catch (error) {
    console.error('創建餐廳失敗:', error);
    throw new Error('創建餐廳失敗，請稍後再試');
  }
};

/**
 * 獲取當前用戶的餐廳列表
 * @param userId 用戶ID
 */
export const getRestaurants = async (userId: string): Promise<Restaurant[]> => {
  try {
    const q = query(
      collection(db, 'restaurants'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const restaurants: Restaurant[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      restaurants.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        address: data.address,
        contact: data.contact,
        imageUrl: data.imageUrl,
        minimumOrder: data.minimumOrder,
        openingHours: data.openingHours,
        isActive: data.isActive,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        notes: data.notes,
        tags: data.tags || []
      } as Restaurant);
    });

    return restaurants;
  } catch (error) {
    console.error('獲取餐廳列表失敗:', error);
    throw new Error('獲取餐廳列表失敗，請稍後再試');
  }
};

/**
 * 獲取單個餐廳
 * @param restaurantId 餐廳ID
 */
export const getRestaurant = async (restaurantId: string): Promise<Restaurant | null> => {
  try {
    const docRef = doc(db, 'restaurants', restaurantId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data
      } as Restaurant;
    } else {
      return null;
    }
  } catch (error) {
    console.error('獲取餐廳失敗:', error);
    throw new Error('獲取餐廳失敗，請稍後再試');
  }
};

/**
 * 更新餐廳
 * @param restaurantId 餐廳ID
 * @param params 更新參數
 */
export const updateRestaurant = async (restaurantId: string, params: Partial<CreateRestaurantParams>): Promise<void> => {
  try {
    const docRef = doc(db, 'restaurants', restaurantId);
    
    await updateDoc(docRef, {
      ...params,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('更新餐廳失敗:', error);
    throw new Error('更新餐廳失敗，請稍後再試');
  }
};

/**
 * 刪除餐廳
 * @param restaurantId 餐廳ID
 */
export const deleteRestaurant = async (restaurantId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'restaurants', restaurantId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('刪除餐廳失敗:', error);
    throw new Error('刪除餐廳失敗，請稍後再試');
  }
};
