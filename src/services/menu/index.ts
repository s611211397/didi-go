import { db } from '@/lib/firebase';
import { MenuItem, CreateMenuItemParams } from '@/type/restaurant';
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
 * 創建新菜單項目
 * @param params 菜單項目參數
 */
export const createMenuItem = async (params: CreateMenuItemParams): Promise<string> => {
  try {
    // 準備菜單項目資料
    const menuItemData = {
      ...params,
      isAvailable: params.isAvailable ?? true, // 預設可訂購
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 確保 tags 欄位存在
    if (!menuItemData.tags) {
      menuItemData.tags = [];
    }

    // 添加文檔到菜單項目集合
    const docRef = await addDoc(collection(db, 'menuItems'), menuItemData);
    console.log('創建菜單項目成功，ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('創建菜單項目失敗:', error);
    throw new Error('創建菜單項目失敗，請稍後再試');
  }
};

/**
 * 獲取餐廳的菜單項目列表
 * @param restaurantId 餐廳ID
 */
export const getMenuItems = async (restaurantId: string): Promise<MenuItem[]> => {
  try {
    // 查詢特定餐廳的菜單項目
    const q = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const menuItems: MenuItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // 確保所有字段都正確映射
      menuItems.push({
        id: doc.id,
        restaurantId: data.restaurantId,
        name: data.name,
        description: data.description || '',
        price: data.price,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable !== false, // 預設為 true
        isPopular: data.isPopular,
        categoryId: data.categoryId,
        options: data.options,
        tags: data.tags || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as MenuItem);
    });

    return menuItems;
  } catch (error) {
    console.error('獲取菜單項目列表失敗:', error);
    throw new Error('獲取菜單項目列表失敗，請稍後再試');
  }
};

/**
 * 獲取單個菜單項目
 * @param menuItemId 菜單項目ID
 */
export const getMenuItem = async (menuItemId: string): Promise<MenuItem | null> => {
  try {
    const docRef = doc(db, 'menuItems', menuItemId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        isAvailable: data.isAvailable !== false, // 預設為 true
        tags: data.tags || []
      } as MenuItem;
    } else {
      return null;
    }
  } catch (error) {
    console.error('獲取菜單項目失敗:', error);
    throw new Error('獲取菜單項目失敗，請稍後再試');
  }
};

/**
 * 更新菜單項目
 * @param menuItemId 菜單項目ID
 * @param params 更新參數
 */
export const updateMenuItem = async (menuItemId: string, params: Partial<CreateMenuItemParams>): Promise<void> => {
  try {
    const docRef = doc(db, 'menuItems', menuItemId);
    
    await updateDoc(docRef, {
      ...params,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('更新菜單項目失敗:', error);
    throw new Error('更新菜單項目失敗，請稍後再試');
  }
};

/**
 * 刪除菜單項目
 * @param menuItemId 菜單項目ID
 */
export const deleteMenuItem = async (menuItemId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'menuItems', menuItemId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('刪除菜單項目失敗:', error);
    throw new Error('刪除菜單項目失敗，請稍後再試');
  }
};

/**
 * 根據類別獲取菜單項目
 * @param restaurantId 餐廳ID
 * @param categoryId 類別ID
 */
export const getMenuItemsByCategory = async (restaurantId: string, categoryId: string): Promise<MenuItem[]> => {
  try {
    const q = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId),
      where('categoryId', '==', categoryId),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const menuItems: MenuItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      menuItems.push({
        id: doc.id,
        ...data,
        isAvailable: data.isAvailable !== false,
        tags: data.tags || []
      } as MenuItem);
    });

    return menuItems;
  } catch (error) {
    console.error('獲取類別菜單項目失敗:', error);
    throw new Error('獲取類別菜單項目失敗，請稍後再試');
  }
};
