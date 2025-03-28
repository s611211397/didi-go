'use client';

import Link from 'next/link';
import React from 'react';

/**
 * 功能卡片元件 - 用於首頁顯示主要功能
 * 
 * @param title 卡片標題
 * @param description 卡片描述
 * @param icon 卡片圖標元件
 * @param linkTo 點擊卡片導向的路徑
 * @param color 卡片頂部邊框顏色 (使用 Tailwind 邊框顏色類)
 */
interface FeatureCardProps {
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  linkTo: string; 
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  linkTo, 
  color 
}) => (
  <Link 
    href={linkTo} 
    className={`flex flex-col items-center p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg border-t-4 ${color}`}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-[#484848] mb-2">{title}</h3>
    <p className="text-[#767676] text-center">{description}</p>
  </Link>
);

export default FeatureCard;
