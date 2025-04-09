'use client';

import React from 'react';
import { OrderItem } from '@/type/order';

interface OrderItemsTableProps {
  orderItems: OrderItem[];
  onDeleteItem: (itemId: string) => Promise<void> | void;
  emptyStateMessage?: string;
  className?: string;
  readOnly?: boolean;
  notes?: string;
  deliveryOption?: string;
  onNotesChange?: (value: string) => void;
  onDeliveryOptionChange?: (value: string) => void;
}

/**
 * 訂單項目表格元件
 * 用於顯示訂單的詳細項目，包含商品名稱、價格、數量等資訊
 */
const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  orderItems,
  onDeleteItem,
  emptyStateMessage = "目前沒有訂單項目",
  className = "",
  readOnly = false,
  notes = "",
  deliveryOption = "外送",
  onNotesChange,
  onDeliveryOptionChange,
}) => {
  // 計算總金額
  const calculateTotal = (): number => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0);
  };

  // 處理備註變更
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onNotesChange) {
      onNotesChange(e.target.value);
    }
  };

  // 處理送達選項變更
  const handleDeliveryOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onDeliveryOptionChange) {
      onDeliveryOptionChange(e.target.value);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                菜名
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                單價
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                數量
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                小計
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                訂購人
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderItems.length > 0 ? (
              orderItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div>{item.menuItemName}</div>
                    {item.notes && (
                      <div className="text-xs italic text-gray-500 mt-1">
                        備註：{item.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    NT$ {item.unitPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    NT$ {item.subtotal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-[#EF4444] hover:text-[#DC2626] transition-colors"
                      aria-label="刪除項目"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {emptyStateMessage}
                </td>
              </tr>
            )}
          </tbody>
          {/* 總計金額行 */}
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                總計金額：
              </td>
              <td colSpan={3} className="px-6 py-4 text-left text-base font-bold text-gray-900">
                NT$ {calculateTotal()}
              </td>
            </tr>
            
            {/* 表單元素 */}
            {!readOnly && (
              <>
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    <label htmlFor="delivery-option" id="delivery-option-label">送達選項：</label>
                  </td>
                  <td colSpan={3} className="px-6 py-4 text-left">
                    <select
                      name="deliveryOption"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      value={deliveryOption}
                      onChange={handleDeliveryOptionChange}
                      aria-labelledby="delivery-option-label"
                      id="delivery-option"
                      title="送達選項"
                      aria-label="送達選項"
                    >
                      <option value="外送">外送</option>
                      <option value="自取">自取</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    <label htmlFor="order-notes" id="order-notes-label">備註：</label>
                  </td>
                  <td colSpan={3} className="px-6 py-4 text-left">
                    <textarea
                      name="notes"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      placeholder="輸入送達地址、特別要求等備註"
                      rows={3}
                      value={notes}
                      onChange={handleNotesChange}
                      aria-labelledby="order-notes-label"
                      id="order-notes"
                      title="訂單備註"
                      aria-label="訂單備註"
                    />
                  </td>
                </tr>
              </>
            )}
            
            {/* 顯示預覽備註和送達選項（唯讀模式） */}
            {readOnly && notes && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  備註：
                </td>
                <td colSpan={3} className="px-6 py-4 text-left text-sm text-gray-500">
                  {notes}
                </td>
              </tr>
            )}
            {readOnly && deliveryOption && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  送達選項：
                </td>
                <td colSpan={3} className="px-6 py-4 text-left text-sm text-gray-500">
                  {deliveryOption}
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderItemsTable;