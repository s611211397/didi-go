/**
 * 通用型別定義和列舉
 */

// Firebase 文件ID型別
export type FirebaseDocId = string;

// 時間戳記型別
export type Timestamp = {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
  toMillis: () => number;
};

// 訂單狀態列舉
export enum OrderStatus {
  ORDERING = 'ordering',     // 訂購中
  COLLECTING = 'collecting', // 收款中
  COMPLETED = 'completed',   // 已完成
}

// 付款狀態列舉
export enum PaymentStatus {
  UNPAID = 'unpaid',       // 未付款
  PAID = 'paid',           // 已付款
}

// 基礎模型介面，包含共用屬性
export interface BaseModel {
  id: FirebaseDocId;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

// 聯絡資訊介面
export interface ContactInfo {
  phone?: string;
  email?: string;
  contactPerson?: string;
}

// 地址介面
export interface Address {
  street: string;
  city?: string;
  district?: string;
  postalCode?: string;
  notes?: string;
}