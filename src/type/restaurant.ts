import { Address, BaseModel, ContactInfo, FirebaseDocId } from './common';

/**
 * 餐廳介面
 */
export interface Restaurant extends BaseModel {
  name: string;
  description?: string;
  address: Address;
  contact: ContactInfo;
  imageUrl?: string;
  minimumOrder?: number;        // 最低訂購金額
  deliveryFee?: number;         // 外送費用
  estimatedDeliveryTime?: number; // 預估送達時間（分鐘）
  openingHours?: OpeningHours;  // 營業時間
  menuItemsCount?: number;      // 菜單項目數量（方便快速顯示）
  isActive: boolean;            // 是否啟用
  createdBy: FirebaseDocId;     // 建立者ID
  notes?: string;               // 備註事項
  tags?: string[];              // 標籤
}

/**
 * 營業時間介面
 */
export interface OpeningHours {
  monday?: DailyHours;
  tuesday?: DailyHours;
  wednesday?: DailyHours;
  thursday?: DailyHours;
  friday?: DailyHours;
  saturday?: DailyHours;
  sunday?: DailyHours;
}

/**
 * 每日營業時間
 */
export interface DailyHours {
  isOpen: boolean;        // 是否營業
  periods: TimePeriod[];  // 營業時段（可能有多個時段）
}

/**
 * 時間段介面
 */
export interface TimePeriod {
  start: string;  // 格式: "HH:MM"
  end: string;    // 格式: "HH:MM"
}

/**
 * 菜單分類
 */
export interface MenuCategory {
  id: FirebaseDocId | string;
  name: string;
  description?: string;
  order: number;  // 顯示順序
}

/**
 * 菜單項目介面
 */
export interface MenuItem extends BaseModel {
  restaurantId: FirebaseDocId;  // 所屬餐廳ID
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;        // 是否可訂購
  isPopular?: boolean;         // 是否為熱門項目
  categoryId?: string;         // 所屬分類ID
  options?: MenuItemOption[];  // 可選配料/選項
  tags?: string[];             // 標籤（如：辣、素食等）
}

/**
 * 菜單項目選項
 */
export interface MenuItemOption {
  name: string;
  selections: MenuItemSelection[];
  required: boolean;
  multiSelect: boolean;  // 是否可多選
  maxSelections?: number; // 最多可選數量
}

/**
 * 菜單項目選項的選擇
 */
export interface MenuItemSelection {
  name: string;
  priceAdjustment: number;  // 價格調整（可為負數表示折扣）
}

/**
 * 建立餐廳的參數
 */
export interface CreateRestaurantParams {
  name: string;
  description?: string;
  address: Address;
  contact: ContactInfo;
  imageUrl?: string;
  minimumOrder?: number;
  deliveryFee?: number;
  estimatedDeliveryTime?: number;
  openingHours?: OpeningHours;
  notes?: string;
  tags?: string[];
}

/**
 * 建立菜單項目的參數
 */
export interface CreateMenuItemParams {
  restaurantId: FirebaseDocId;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  isPopular?: boolean;
  categoryId?: string;
  options?: MenuItemOption[];
  allergens?: string[];
  tags?: string[];
}