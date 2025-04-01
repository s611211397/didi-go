'use client';

import React, { useState } from 'react';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const ComponentTestPage: React.FC = () => {
  // 設置不同的狀態來測試各種日期時間選擇器
  const [basicDateTime, setBasicDateTime] = useState<Date | null>(null);
  const [onlyDatePicker, setOnlyDatePicker] = useState<Date | null>(null);
  const [onlyTimePicker, setOnlyTimePicker] = useState<Date | null>(new Date());
  const [withMinMaxDate, setWithMinMaxDate] = useState<Date | null>(null);
  const [withError, setWithError] = useState<Date | null>(null);
  const [disabledPicker, setDisabledPicker] = useState<Date | null>(null);

  // 獲取今天和10天後的日期，用於最小/最大日期限制
  const today = new Date();
  const tenDaysLater = new Date();
  tenDaysLater.setDate(today.getDate() + 10);

  // 格式化日期時間顯示
  const formatDateTime = (date: Date | null): string => {
    if (!date) return '尚未選擇';
    return format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhTW });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">日期時間選擇器測試頁面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 基本日期時間選擇器 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">基本日期時間選擇器</h2>
          <DateTimePicker
            label="選擇日期和時間"
            selectedDate={basicDateTime}
            onChange={setBasicDateTime}
            placeholderText="請選擇日期和時間"
          />
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">已選擇：</p>
            <p className="text-base font-medium text-gray-800">{formatDateTime(basicDateTime)}</p>
          </div>
        </div>

        {/* 僅日期選擇器 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">僅日期選擇器</h2>
          <DateTimePicker
            label="僅選擇日期"
            selectedDate={onlyDatePicker}
            onChange={setOnlyDatePicker}
            showTimeSelect={false}
            dateFormat="yyyy/MM/dd"
            placeholderText="請選擇日期"
          />
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">已選擇：</p>
            <p className="text-base font-medium text-gray-800">
              {onlyDatePicker ? format(onlyDatePicker, 'yyyy年MM月dd日', { locale: zhTW }) : '尚未選擇'}
            </p>
          </div>
        </div>

        {/* 僅時間選擇器 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">僅時間選擇器</h2>
          <DateTimePicker
            label="僅選擇時間"
            selectedDate={onlyTimePicker}
            onChange={setOnlyTimePicker}
            showTimeSelectOnly={true}
            dateFormat="HH:mm"
            timeIntervals={30}
            placeholderText="請選擇時間"
            timeCaption="時間"
          />
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">已選擇：</p>
            <p className="text-base font-medium text-gray-800">
              {onlyTimePicker ? format(onlyTimePicker, 'HH:mm', { locale: zhTW }) : '尚未選擇'}
            </p>
          </div>
        </div>

        {/* 有最小/最大日期限制的選擇器 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">日期範圍限制</h2>
          <DateTimePicker
            label="限定日期範圍（今天至10天後）"
            selectedDate={withMinMaxDate}
            onChange={setWithMinMaxDate}
            minDate={today}
            maxDate={tenDaysLater}
            placeholderText="請在限定範圍內選擇"
            required
          />
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">已選擇：</p>
            <p className="text-base font-medium text-gray-800">{formatDateTime(withMinMaxDate)}</p>
            <p className="text-xs text-gray-500 mt-2">
              可選範圍：{format(today, 'yyyy/MM/dd')} 至 {format(tenDaysLater, 'yyyy/MM/dd')}
            </p>
          </div>
        </div>

        {/* 帶錯誤提示的選擇器 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">帶錯誤提示</h2>
          <DateTimePicker
            label="帶錯誤提示的日期選擇器"
            selectedDate={withError}
            onChange={setWithError}
            error="請選擇有效的截止時間"
            required
          />
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">已選擇：</p>
            <p className="text-base font-medium text-gray-800">{formatDateTime(withError)}</p>
          </div>
        </div>

        {/* 禁用狀態的選擇器 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">禁用狀態</h2>
          <DateTimePicker
            label="禁用狀態的日期選擇器"
            selectedDate={disabledPicker}
            onChange={setDisabledPicker}
            disabled={true}
            placeholderText="此選擇器已禁用"
          />
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">此選擇器不可用，常用於顯示歷史記錄或唯讀資訊</p>
          </div>
        </div>
      </div>

      <div className="mt-10 mb-4 border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">使用範例</h2>
        <div className="bg-gray-800 text-gray-100 p-6 rounded-lg overflow-auto">
          <pre className="text-sm">
{`// 在你的組件中
import { useState } from 'react';
import DateTimePicker from '@/components/ui/DateTimePicker';

const YourComponent = () => {
  const [deadlineTime, setDeadlineTime] = useState<Date | null>(null);

  return (
    <div>
      <DateTimePicker
        label="訂單截止時間"
        selectedDate={deadlineTime}
        onChange={setDeadlineTime}
        required
        minDate={new Date()}
        placeholderText="請選擇截止時間"
      />
    </div>
  );
};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ComponentTestPage;
