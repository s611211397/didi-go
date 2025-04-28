'use client';

import React from 'react';
import { OrderTabContentProps } from './types';
import UserOrderTooltip from './UserOrderTooltip';
import { useOrderItemsLogic } from './hooks/useOrderItemsLogic';

/**
 * 訂購頁籤內容元件
 * 顯示訂單的詳細項目，相同品名和相同備註的訂單會被合併顯示
 */
const OrderTabContent: React.FC<OrderTabContentProps> = ({
  orderItems,
  onDeleteItem,
  emptyStateMessage = "目前沒有訂單項目",
  readOnly = false,
  isOrderCreator = false
}) => {
  const { consolidatedItems, calculateTotal } = useOrderItemsLogic({ orderItems });

  // 處理刪除項目
  const handleDeleteItem = async (originalIds: string[]) => {
    try {
      // 如果是訂單創建者，一次刪除全部相同品名項目
      if (isOrderCreator && originalIds.length > 0) {
        // 使用第一個 ID 作為基礎 ID，並將其餘項目作為批量刪除列表
        await onDeleteItem(originalIds[0], originalIds);
        return;
      }
      
      // 非訂單創建者只能刪除自己的項目
      if (originalIds.length === 1) {
        await onDeleteItem(originalIds[0]);
      }
    } catch (error) {
      console.error('刪除項目時發生錯誤:', error);
    }
  };

  return (
    <div className="inline-block min-w-full align-middle">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              品名
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
          {consolidatedItems.length > 0 ? (
            consolidatedItems.map((item) => (
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
                  $ {item.unitPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $ {item.subtotal}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <UserOrderTooltip item={item} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!readOnly && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteItem(item.originalIds);
                      }}
                      className="text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer"
                      aria-label="刪除項目"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
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
            <td colSpan={6} className="px-6 py-4 text-left text-base font-bold text-gray-900">
              總計金額：$ {calculateTotal()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default OrderTabContent;
