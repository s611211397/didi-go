import { OrderItem } from '@/type/order';

/**
 * 基礎 OrderItemsTable 屬性介面
 */
export interface OrderItemsTableProps {
  orderItems: OrderItem[];
  onDeleteItem: (itemId: string, itemsToDelete?: string[]) => Promise<void> | void;
  onUpdatePaymentStatus?: (userId: string, isPaid: boolean, amount: number) => void;
  emptyStateMessage?: string;
  className?: string;
  readOnly?: boolean;
  isOrderCreator?: boolean;
  isSubmitted?: boolean;
  disablePaymentTab?: boolean;
  onTabChange?: (tab: 'order' | 'payment') => void;
}

/**
 * 訂購頁籤屬性介面
 */
export interface OrderTabContentProps {
  orderItems: OrderItem[];
  onDeleteItem: (itemId: string, itemsToDelete?: string[]) => Promise<void> | void;
  emptyStateMessage?: string;
  readOnly?: boolean;
  isOrderCreator?: boolean;
}

/**
 * 收款頁籤屬性介面
 */
export interface PaymentTabContentProps {
  orderItems: OrderItem[];
  onUpdatePaymentStatus?: (userId: string, isPaid: boolean, amount: number) => void;
  emptyStateMessage?: string;
}

/**
 * 頁籤屬性介面
 */
export interface OrderTabsProps {
  activeTab: 'order' | 'payment';
  onTabChange: (tab: 'order' | 'payment') => void;
  isSubmitted?: boolean;
  disablePaymentTab?: boolean;
}

/**
 * 收款進度條屬性介面
 */
export interface PaymentProgressBarProps {
  collected: number;
  total: number;
}

/**
 * 使用者訂購資訊的介面
 */
export interface UserOrderInfo {
  userName: string;
  quantity: number;
  originalId: string;
}

/**
 * 合併訂單項目介面
 */
export interface ConsolidatedOrderItem extends Omit<OrderItem, 'id' | 'userId' | 'userName'> {
  id: string;
  originalIds: string[];
  userNames: string[];
  userCount: number;
  userOrders: UserOrderInfo[];
}

/**
 * 付款視圖中的訂單項目介面
 */
export interface PaymentViewItem {
  userId: string;
  userName: string;
  isPaid: boolean;
  total: number;
  orderDetails: {
    menuItemName: string;
    quantity: number;
    subtotal: number;
    notes?: string;
  }[];
}

/**
 * 使用者訂購提示屬性介面
 */
export interface UserOrderTooltipProps {
  item: ConsolidatedOrderItem;
}

/**
 * 訂單詳情提示屬性介面
 */
export interface OrderDetailsTooltipProps {
  details: PaymentViewItem['orderDetails'];
}
