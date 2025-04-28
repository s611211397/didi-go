'use client';

import React from 'react';
import { UserOrderTooltipProps } from './types';

/**
 * 用戶訂購提示元件
 * 顯示多個用戶訂購同一商品的詳細資訊
 */
const UserOrderTooltip: React.FC<UserOrderTooltipProps> = ({ item }) => {
  // 如果只有一個訂購人，直接顯示名稱
  if (item.userCount === 1) {
    return <div>{item.userNames[0]}</div>;
  }
  
  // 多個訂購人時，顯示第一位訂購人 + 懸停顯示全部
  return (
    <div className="group relative inline-block">
      <div className="cursor-help flex items-center">
        <span className="font-medium">{item.userNames[0]}</span>
        <span className="text-sm text-gray-500 ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full">+{item.userCount - 1}人</span>
        <span className="ml-1 text-blue-500 text-xs">▼</span>
      </div>
      
      {/* 懸停時顯示的 tooltip - 網格區域來拖住滑鼠 */}
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity delay-75 duration-200 absolute z-10 left-0 mt-1">
        <div className="p-5 -mt-2 -mx-5">
          <div className="w-64 p-3 bg-white border border-gray-200 rounded-md shadow-lg text-sm">
            <div className="font-medium text-gray-700 pb-1 border-b border-gray-200 mb-2">
              所有訂購人 ({item.userCount} 人合計訂購 {item.quantity} 份)
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {/* 使用 userOrders 資料結構約和訂購數量 */}
              {Object.entries(
                // 計算每位使用者的總訂購數量
                item.userOrders.reduce((acc: Record<string, number>, order) => {
                  acc[order.userName] = (acc[order.userName] || 0) + order.quantity;
                  return acc;
                }, {})
              )
              .sort((a, b) => b[1] - a[1]) // 按數量降序排列
              .map(([userName, quantity]) => (
                <li key={userName} className="flex justify-between items-center hover:bg-gray-50 px-1.5 py-1 rounded">
                  <span className="text-gray-700">{userName}</span>
                  <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-full">
                    訂購 {quantity} 份
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderTooltip;
