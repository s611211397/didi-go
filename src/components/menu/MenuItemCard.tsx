'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/type/restaurant';
import Button from '@/components/ui/Button';
import { MessageDialog } from '@/components/ui/dialog';

interface MenuItemCardProps {
  menuItem: MenuItem;
  onEdit: (menuItem: MenuItem) => void;
  onDelete: (menuItemId: string) => Promise<void>;
}

/**
 * 菜單項目卡片元件
 */
const MenuItemCard: React.FC<MenuItemCardProps> = ({ menuItem, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 處理刪除確認
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDelete(menuItem.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('刪除菜單項目失敗:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-[#E5E7EB]">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1 mb-2">
              <h3 className="text-lg font-semibold text-[#484848]">{menuItem.name}</h3>
              
              {/* 標籤移至菜名後方 */}
              {menuItem.tags && menuItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {menuItem.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-[#F7F7F7] text-[#767676] text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* 價格 */}
            <div className="text-lg font-semibold text-[#10B981] mb-2">
              NT$ {menuItem.price.toLocaleString()}
            </div>
            
            {/* 描述/備註 */}
            {menuItem.description && (
              <p className="text-[#767676] text-sm mb-3">{menuItem.description}</p>
            )}
          </div>
        </div>
        
        {/* 操作按鈕 */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(menuItem)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            }
          >
            編輯
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            }
          >
            刪除
          </Button>
        </div>
        
        {/* 確認刪除對話框 - 使用統一的 MessageDialog */}
        <MessageDialog
          show={showDeleteConfirm}
          type="confirm"
          title="確認刪除"
          message={
            <>您確定要刪除「{menuItem.name}」菜單項目嗎？此操作無法恢復。</>
          }
          primaryButton={{
            text: isDeleting ? "刪除中..." : "確認刪除",
            variant: "danger",
            onClick: handleDeleteConfirm
          }}
          secondaryButton={{
            text: "取消",
            variant: "outline",
            onClick: () => setShowDeleteConfirm(false)
          }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

export default MenuItemCard;