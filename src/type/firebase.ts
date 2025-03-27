import { Timestamp as FirebaseTimestamp } from 'firebase/firestore';
import { FirebaseDocId, Timestamp } from './common';

/**
 * Firebase查詢參數
 * @eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
export interface FirebaseQueryParams {
  collection: string;
  where?: QueryWhereClause[];
  orderBy?: QueryOrderByClause[];
  limit?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  startAfter?: Record<string, any> | null;
}

/**
 * 查詢條件子句
 */
export interface QueryWhereClause {
  field: string;
  operator: WhereFilterOp;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any; // 可能是多種不同的型別
}

/**
 * 排序子句
 */
export interface QueryOrderByClause {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Firebase 查詢運算符
 */
export type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'array-contains-any'
  | 'in'
  | 'not-in';

/**
 * 文件轉換方法
 * 用於將Firestore文件轉換為應用程式模型
 */
export interface FirebaseConverter<T> {
  toFirestore: (modelObject: T) => Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromFirestore: (snapshot: any) => T;
}

/**
 * 分頁結果
 */
export interface PaginatedResult<T> {
  items: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastDoc: any | null;
  hasMore: boolean;
}

/**
 * Firebase時間戳轉換函數
 * 將Firebase Timestamp轉換為應用程式內部使用的Timestamp型別
 */
export function convertTimestamp(timestamp: FirebaseTimestamp | null): Timestamp | null {
  if (!timestamp) return null;
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
    toDate: () => timestamp.toDate(),
    toMillis: () => timestamp.toMillis(),
  };
}

/**
 * 文件ID獲取函數
 * 從Firebase文件中獲取ID
 */
export function getDocId(doc: { id: FirebaseDocId }): FirebaseDocId {
  return doc.id;
}

/**
 * 轉換文件資料
 * 將Firebase文件資料轉換為應用程式模型，添加ID和時間戳
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertDoc<T>(doc: { id: FirebaseDocId; data: () => any }): T & { id: FirebaseDocId } {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: data.createdAt ? convertTimestamp(data.createdAt as any) : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt as any) : null,
  } as T & { id: FirebaseDocId };
}