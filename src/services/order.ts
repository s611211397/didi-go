import { db } from '@/lib/firebase';
import { Order, CreateOrderParams, OrderItem, CreateOrderItemParams } from '@/type/order';
import { OrderStatus, PaymentStatus } from '@/type/common';
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
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';

/**
 * 創建新訂單
 * @param params 訂單參數
 * @param userId 創建者ID (組織者ID)
 */
export const createOrder = async (params: CreateOrderParams, userId: string): Promise<string> => {
  try {
    // 設置訂單資料
    const orderData = {
      ...params,
      organizerId: userId,
      status: OrderStatus.ORDERING,
      paymentStatus: PaymentStatus.UNPAID,
      totalAmount: 0, // 初始總金額為0，會隨著訂單項目更新
      deadlineTime: params.deadlineTime instanceof Date 
        ? Timestamp.fromDate(params.deadlineTime) 
        : params.deadlineTime,
      estimatedDeliveryTime: params.estimatedDeliveryTime instanceof Date 
        ? Timestamp.fromDate(params.estimatedDeliveryTime) 
        : params.estimatedDeliveryTime,
      isArchived: false,
      participantsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 添加文檔到訂單集合
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    console.log('創建訂單成功，ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('創建訂單失敗:', error);
    throw new Error('創建訂單失敗，請稍後再試');
  }
};

/**
 * 獲取用戶創建的所有訂單
 * @param userId 用戶ID
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    // 查詢用戶創建的訂單
    const q = query(
      collection(db, 'orders'),
      where('organizerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('獲取訂單列表失敗:', error);
    throw new Error('獲取訂單列表失敗，請稍後再試');
  }
};

/**
 * 獲取單個訂單詳情
 * @param orderId 訂單ID
 */
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data
      } as Order;
    } else {
      return null;
    }
  } catch (error) {
    console.error('獲取訂單失敗:', error);
    throw new Error('獲取訂單失敗，請稍後再試');
  }
};

/**
 * 更新訂單
 * @param orderId 訂單ID
 * @param params 更新參數
 */
export const updateOrder = async (orderId: string, params: Partial<CreateOrderParams>): Promise<void> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    
    // 創建更新資料物件
    const updateData = {
      ...params,
      updatedAt: serverTimestamp()
    };
    
    // 處理日期欄位
    if (params.deadlineTime instanceof Date) {
      updateData.deadlineTime = Timestamp.fromDate(params.deadlineTime);
    }
    if (params.estimatedDeliveryTime instanceof Date) {
      updateData.estimatedDeliveryTime = Timestamp.fromDate(params.estimatedDeliveryTime);
    }
    
    // 使用類型斷言以解決類型不相容問題
    await updateDoc(docRef, updateData as DocumentData);
  } catch (error) {
    console.error('更新訂單失敗:', error);
    throw new Error('更新訂單失敗，請稍後再試');
  }
};

/**
 * 更新訂單狀態
 * @param orderId 訂單ID
 * @param status 新狀態
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    } as DocumentData);
  } catch (error) {
    console.error('更新訂單狀態失敗:', error);
    throw new Error('更新訂單狀態失敗，請稍後再試');
  }
};

/**
 * 刪除訂單
 * @param orderId 訂單ID
 */
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('刪除訂單失敗:', error);
    throw new Error('刪除訂單失敗，請稍後再試');
  }
};

/**
 * 獲取訂單項目列表
 * @param orderId 訂單ID
 */
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const orderItemsRef = collection(db, 'orders', orderId, 'order_items');
    const querySnapshot = await getDocs(orderItemsRef);
    
    const orderItems: OrderItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orderItems.push({
        id: doc.id,
        ...data
      } as OrderItem);
    });
    
    return orderItems;
  } catch (error) {
    console.error('獲取訂單項目失敗:', error);
    throw new Error('獲取訂單項目失敗，請稍後再試');
  }
};

/**
 * 創建訂單項目
 * @param orderId 訂單ID
 * @param params 訂單項目參數
 * @param userId 用戶ID
 * @param userName 用戶名稱
 */
export const createOrderItem = async (
  orderId: string,
  params: CreateOrderItemParams,
  userId: string,
  userName: string
): Promise<string> => {
  try {
    // 計算小計金額
    const subtotal = params.quantity * params.unitPrice;
    
    const itemData = {
      ...params,
      userId,
      userName,
      subtotal,
      isPaid: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // 添加到訂單項目子集合
    const docRef = await addDoc(
      collection(db, 'orders', orderId, 'order_items'),
      itemData
    );
    
    // 更新訂單總金額
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      const orderData = orderSnap.data();
      const currentTotal = orderData.totalAmount || 0;
      
      await updateDoc(orderRef, {
        totalAmount: currentTotal + subtotal,
        updatedAt: serverTimestamp()
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('創建訂單項目失敗:', error);
    throw new Error('創建訂單項目失敗，請稍後再試');
  }
};

/**
 * 刪除訂單項目
 * @param orderId 訂單ID
 * @param itemId 項目ID
 */
export const deleteOrderItem = async (orderId: string, itemId: string): Promise<void> => {
  try {
    // 先獲取訂單項目，以便更新訂單總金額
    const itemRef = doc(db, 'orders', orderId, 'order_items', itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (itemSnap.exists()) {
      const itemData = itemSnap.data();
      const subtotal = itemData.subtotal || 0;
      
      // 刪除訂單項目
      await deleteDoc(itemRef);
      
      // 更新訂單總金額
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        const currentTotal = orderData.totalAmount || 0;
        
        await updateDoc(orderRef, {
          totalAmount: Math.max(0, currentTotal - subtotal),
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('刪除訂單項目失敗:', error);
    throw new Error('刪除訂單項目失敗，請稍後再試');
  }
};

/**
 * 更新訂單項目付款狀態
 * @param orderId 訂單ID
 * @param itemId 項目ID
 * @param isPaid 是否已付款
 */
export const updateOrderItemPaymentStatus = async (
  orderId: string, 
  itemId: string, 
  isPaid: boolean
): Promise<void> => {
  try {
    const itemRef = doc(db, 'orders', orderId, 'order_items', itemId);
    
    await updateDoc(itemRef, {
      isPaid,
      paymentTime: isPaid ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
    
    // 如果需要，可以在這裡更新訂單的總付款狀態
    // 例如檢查所有項目是否已付款，然後更新訂單的付款狀態
  } catch (error) {
    console.error('更新付款狀態失敗:', error);
    throw new Error('更新付款狀態失敗，請稍後再試');
  }
};
