'use client';

import React, { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { MenuItem, CreateMenuItemParams } from '@/type/restaurant';
import { MessageDialog } from '@/components/ui/dialog';

/**
 * 菜單項目表單介面
 */
export interface MenuItemFormProps {
  restaurantId: string;
  menuItem?: MenuItem;
  onClose: () => void;
  onSave: (data: CreateMenuItemParams) => Promise<void>;
}

/**
 * 表單數據類型
 */
interface FormData {
  name: string;
  price: string;
  description: string;
}

/**
 * 菜單項目表單元件
 * 
 * 用於創建或編輯餐廳菜單項目
 */
const MenuItemForm: React.FC<MenuItemFormProps> = ({ 
  restaurantId, 
  menuItem, 
  onClose, 
  onSave 
}) => {
  // 表單狀態管理
  const { handleSubmit, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: menuItem?.name || '',
      price: menuItem?.price.toString() || '',
      description: menuItem?.description || '',
    }
  });
  
  // 元件內部狀態
  const [tags, setTags] = useState<string[]>(menuItem?.tags || []);
  const [tagInput, setTagInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  
  // 建立輸入框的 refs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  // 為每個輸入框創建專用的鍵盤處理函數
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      priceInputRef.current?.focus();
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tagInputRef.current?.focus();
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      tagInputRef.current?.focus();
    }
  };
  
  // 處理標籤新增
  const handleAddTag = () => {
    if (tagInput.trim() === '') return;
    
    // 按「、」分割輸入，處理多個類別標籤
    const newTags = tagInput
      .split('、')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    if (newTags.length === 0) return;
    
    setTags([...tags, ...newTags]);
    setTagInput('');
  };
  
  // 處理標籤輸入框的鍵盤事件
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 阻止表單提交
      handleAddTag();
    }
  };
  
  // 處理標籤的刪除
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 表單提交處理
  const onSubmitForm = async (formData: FormData) => {
    if (isSubmitting) return;
    
    // 表單驗證
    if (formData.name.trim() === '') {
      setError('請輸入菜單項目名稱');
      setShowErrorDialog(true);
      return;
    }
    
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('請輸入有效價格');
      setShowErrorDialog(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 準備提交資料
      const menuItemData: CreateMenuItemParams = {
        restaurantId,
        name: formData.name.trim(),
        price: price,
        description: formData.description.trim() || '',
        tags: tags.length > 0 ? tags : undefined,
        isAvailable: true
      };

      await onSave(menuItemData);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存菜單項目失敗';
      setError(errorMessage);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 p-3 pt-[85px]" onClick={onClose}>
      <div className="bg-white rounded-lg px-6 pt-0 pb-5 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-1">
          <button 
            onClick={onClose}
            className="text-[#767676] hover:text-[#484848] cursor-pointer mt-2"
            aria-label="關閉"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* 錯誤訊息對話框 */}
        <MessageDialog
          show={showErrorDialog}
          type="error"
          title="表單驗證錯誤"
          message={error || ''}
          primaryButton={{
            text: "確定",
            variant: "primary",
            onClick: () => setShowErrorDialog(false)
          }}
          onClose={() => setShowErrorDialog(false)}
        />

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="mb-3">
            <Controller
              name="name"
              control={control}
              rules={{ required: "請輸入菜單項目名稱" }}
              render={({ field }) => (
                <Input
                  label="名稱"
                  id="name"
                  {...field}
                  onKeyDown={handleNameKeyDown}
                  placeholder="輸入菜單項目名稱"
                  required
                  ref={(e) => {
                    field.ref(e);
                    if (e) nameInputRef.current = e;
                  }}
                  autoComplete="off"
                  error={errors.name?.message}
                />
              )}
            />
          </div>

          <div className="mb-3">
            <Controller
              name="price"
              control={control}
              rules={{ 
                required: "請輸入價格",
                validate: value => parseFloat(value) > 0 || "價格必須大於 0" 
              }}
              render={({ field }) => (
                <Input
                  label="價格 (NT$)"
                  id="price"
                  type="number"
                  {...field}
                  onKeyDown={handlePriceKeyDown}
                  placeholder="輸入價格"
                  min="0"
                  step="1"
                  required
                  ref={(e) => {
                    field.ref(e);
                    if (e) priceInputRef.current = e;
                  }}
                  autoComplete="off"
                  error={errors.price?.message}
                />
              )}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              類別(選填)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-green-600 hover:text-green-800 cursor-pointer text-base font-semibold"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 items-center">
              <Input
                id="tagInput"
                name="tagInput"
                placeholder="輸入，例如：雞肉、牛肉"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1"
                ref={tagInputRef}
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                className="flex-shrink-0"
                onClick={handleAddTag}
                size="input"
              >
                新增
              </Button>
            </div>
            <p className="mt-1 text-sm text-gray-500">使用「、」分隔，可一次輸入多個類別</p>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備註
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  id="description"
                  {...field}
                  onKeyDown={handleDescriptionKeyDown}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] text-black"
                  placeholder="輸入備註"
                  rows={2}
                  ref={(e) => {
                    field.ref(e);
                    if (e) descriptionInputRef.current = e;
                  }}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button 
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button 
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              儲存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;