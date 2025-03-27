import { BaseModel, FirebaseDocId } from './common';

/**
 * 使用者角色列舉
 */
export enum UserRole {
  ADMIN = 'admin',         // 管理員
  USER = 'user',           // 普通使用者
  TEMPORARY = 'temporary', // 臨時使用者
}

/**
 * 使用者介面
 */
export interface User extends BaseModel {
  email: string;
  displayName: string;
  phoneNumber?: string;     // 手機號碼
  role: UserRole;
  favoriteRestaurants?: FirebaseDocId[]; // 收藏的餐廳ID
  recentOrders?: FirebaseDocId[];        // 最近參與的訂單ID
  department?: string;                   // 部門
  photoURL?: string;                     // 頭像圖片URL
}

/**
 * 使用者認證相關資訊
 */
export interface UserAuth {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  emailVerified: boolean;
}

/**
 * 建立使用者的參數
 */
export interface CreateUserParams {
  email: string;
  displayName: string;
  phoneNumber?: string;
  role?: UserRole;
  department?: string;
}

/**
 * 更新使用者的參數
 */
export interface UpdateUserParams {
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  department?: string;
}