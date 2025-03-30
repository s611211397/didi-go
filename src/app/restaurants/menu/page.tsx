'use client';

import { useState } from 'react';
import Link from 'next/link';

// 定義類型
type Restaurant = {
  id: string;
  name: string;
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
};

type MenuItems = {
  [key: string]: MenuItem[];
};

// 模擬餐廳數據
const mockRestaurants: Restaurant[] = [
  { id: '1', name: '好味小廚' },
  { id: '2', name: '台灣牛肉麵' },
];

// 模擬菜單數據
const mockMenuItems: MenuItems = {
  '1': [ // 好味小廚的菜單
    { id: '101', name: '宮保雞丁', price: 180, category: '主菜' },
    { id: '102', name: '糖醋排骨', price: 220, category: '主菜' },
    { id: '103', name: '蝦仁炒蛋', price: 160, category: '主菜' },
    { id: '104', name: '青菜', price: 80, category: '配菜' },
    { id: '105', name: '白飯', price: 25, category: '主食' },
  ],
  '2': [ // 台灣牛肉麵的菜單
    { id: '201', name: '紅燒牛肉麵', price: 150, category: '麵食' },
    { id: '202', name: '清燉牛肉麵', price: 150, category: '麵食' },
    { id: '203', name: '牛肉餃子', price: 120, category: '點心' },
    { id: '204', name: '滷蛋', price: 20, category: '小菜' },
  ],
};

// 菜單項目卡片元件
const MenuItemCard = ({ item }: { item: MenuItem }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {item.category}
        </span>
      </div>
      <p className="text-2xl font-bold text-emerald-600 mt-2">${item.price}</p>
      <div className="mt-auto pt-4 flex justify-end gap-2">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          編輯
        </button>
        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
          刪除
        </button>
      </div>
    </div>
  );
};

export default function MenuPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(mockRestaurants[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // 獲取所有類別
  const allCategories: string[] = Array.from(
    new Set(mockMenuItems[selectedRestaurant].map((item: MenuItem) => item.category))
  );

  // 處理搜尋和篩選
  const filteredMenuItems: MenuItem[] = mockMenuItems[selectedRestaurant].filter((item: MenuItem) => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="container mx-auto px-4 py-8">
      {/* 頂部導航和標題 */}
      <div className="mb-8">
        <div className="flex items-center mb-1">
          <Link 
            href="/restaurants" 
            className="text-emerald-600 hover:text-emerald-700 hover:underline mr-2"
          >
            餐廳管理
          </Link>
          <span className="text-gray-500 mx-2">/</span>
          <span className="text-gray-700">菜單管理</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">菜單管理</h1>
        <p className="text-gray-600 mt-1">管理餐廳的菜單項目</p>
      </div>

      {/* 餐廳選擇和操作區 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-64">
            <label htmlFor="restaurantSelect" className="block text-sm font-medium text-gray-700 mb-1">
              選擇餐廳
            </label>
            <select
              id="restaurantSelect"
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              {mockRestaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            新增菜單項目
          </button>
        </div>
      </div>

      {/* 搜尋和篩選區 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="searchInput" className="block text-sm font-medium text-gray-700 mb-1">
              搜尋菜單項目
            </label>
            <input
              id="searchInput"
              type="text"
              placeholder="輸入菜名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="w-full md:w-1/2">
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
              按類別篩選
            </label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">所有類別</option>
              {allCategories.map((category: string) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 菜單項目列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item: MenuItem) => (
            <MenuItemCard key={item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">沒有找到符合條件的菜單項目</p>
          </div>
        )}
      </div>

      {/* 新增菜單項目的懸浮按鈕 (手機版顯示) */}
      <div className="md:hidden fixed bottom-6 right-6">
        <button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </main>
  );
}
