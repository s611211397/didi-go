import { BaseModel, FirebaseDocId, OrderStatus, PaymentStatus, Timestamp } from './common';

/**
 * 訂單介面
 */
export interface Order extends BaseModel {
  organizerId: FirebaseDocId;          // 發起人ID
  title: string;                       // 訂單標題（例如：「週三午餐」）
  description?: string;                // 訂單描述
  status: OrderStatus;                 // 訂單狀態
  deadlineTime: Timestamp;             // 截止時間
  estimatedDeliveryTime?: Timestamp;   // 預計送達時間
  actualDeliveryTime?: Timestamp;      // 實際送達時間
  totalAmount: number;                 // 總金額
  deliveryFee?: number;                // 外送費用
  finalAmount?: number;                // 最終金額
  paymentStatus: PaymentStatus;        // 付款狀態
  sharedToken?: string;                // 分享連結的令牌
  participantsCount?: number;          // 參與人數
  notes?: string;                      // 備註
  isArchived: boolean;                 // 是否已歸檔
  tags?: string[];                     // 標籤
}

/**
 * 訂單項目介面
 */
export interface OrderItem extends BaseModel {
  userId: FirebaseDocId;               // 下單使用者ID
  userName: string;                    // 使用者名稱（方便顯示）
  menuItemId: FirebaseDocId;           // 菜單項目ID
  menuItemName: string;                // 菜單項目名稱（方便顯示）
  quantity: number;                    // 數量
  unitPrice: number;                   // 單價
  options?: OrderItemOption[];         // 選項配置
  specialRequests?: string;            // 特殊要求
  subtotal: number;                    // 小計金額
  isPaid: boolean;                     // 是否已付款
  paymentMethod?: string;              // 付款方式
  paymentTime?: Timestamp;             // 付款時間
  notes?: string;                      // 備註
}

/**
 * 訂單項目選項
 */
export interface OrderItemOption {
  optionName: string;                  // 選項名稱
  selectionName: string;               // 選擇的內容
  priceAdjustment: number;             // 價格調整
}

/**
 * 付款記錄介面
 */
export interface PaymentRecord extends BaseModel {
  orderItemId?: FirebaseDocId;         // 付款對應的訂單項目ID
  userId: FirebaseDocId;               // 付款使用者ID
  userName: string;                    // 使用者名稱
  amount: number;                      // 付款金額
  method: string;                      // 付款方式
  status: 'completed' | 'pending' | 'failed'; // 付款狀態
  transactionId?: string;              // 交易ID
  notes?: string;                      // 備註
}

/**
 * 訂單歷史記錄介面
 * 用於追蹤訂單狀態變更
 */
export interface OrderHistory extends BaseModel {
  previousStatus?: OrderStatus;        // 先前狀態
  newStatus: OrderStatus;              // 新狀態
  changedBy: FirebaseDocId;            // 變更者ID
  notes?: string;                      // 備註
}

/**
 * 訂單通知介面
 */
export interface OrderNotification extends BaseModel {
  recipientId: FirebaseDocId;          // 接收者ID
  title: string;                       // 通知標題
  message: string;                     // 通知訊息
  type: 'reminder' | 'update' | 'payment'; // 通知類型
  isRead: boolean;                     // 是否已讀
  actionUrl?: string;                  // 動作連結
}

/**
 * 建立訂單的參數
 */
export interface CreateOrderParams {
  title: string;
  description?: string;
  deadlineTime: Date | Timestamp;
  estimatedDeliveryTime?: Date | Timestamp;
  deliveryFee?: number;
  notes?: string;
  tags?: string[];
}

/**
 * 更新訂單狀態的參數
 */
export interface UpdateOrderStatusParams {
  status: OrderStatus;
  notes?: string;
}

/**
 * 建立訂單項目的參數
 */
export interface CreateOrderItemParams {
  menuItemId: FirebaseDocId;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  options?: OrderItemOption[];
  specialRequests?: string;
  notes?: string;
}

/**
 * 訂單統計摘要
 * 用於儀表板顯示
 */
export interface OrderSummary {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  topRestaurants: {
    restaurantName: string;
    orderCount: number;
  }[];
}