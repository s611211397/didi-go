import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { zhTW } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

// 定義組件的 props 類型
interface DateTimePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeIntervals?: number;
  timeCaption?: string;
  dateFormat?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  name?: string;
  id?: string;
}

// 自定義輸入元件
interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(
  ({ value, onClick, placeholder, disabled, required }, ref) => (
    <button
      type="button"
      className={`
        w-full px-4 py-2 rounded border text-left 
        focus:outline-none focus:ring-2 focus:ring-green-500 
        ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white hover:bg-gray-50'} 
        ${value ? 'text-gray-700' : 'text-gray-400'}
      `}
      onClick={onClick}
      ref={ref}
      disabled={disabled}
    >
      {value || placeholder}
      {required && !value && <span className="text-red-500 ml-1">*</span>}
    </button>
  )
);

CustomInput.displayName = 'CustomInput';

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  onChange,
  placeholderText = '選擇日期和時間',
  showTimeSelect = true,
  showTimeSelectOnly = false,
  timeIntervals = 15,
  timeCaption = '時間',
  dateFormat = 'yyyy/MM/dd HH:mm',
  className = '',
  minDate,
  maxDate,
  disabled = false,
  required = false,
  label,
  error,
  name,
  id,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={className}>
        <DatePicker
          selected={selectedDate}
          onChange={onChange}
          customInput={
            <CustomInput 
              placeholder={placeholderText} 
              disabled={disabled} 
              required={required}
            />
          }
          showTimeSelect={showTimeSelect}
          showTimeSelectOnly={showTimeSelectOnly}
          timeIntervals={timeIntervals}
          timeCaption={timeCaption}
          dateFormat={dateFormat}
          minDate={minDate}
          maxDate={maxDate}
          locale={zhTW}
          popperClassName="z-50" // 確保日曆選擇器顯示在上層
          disabled={disabled}
          // 確保彈出的日曆選擇器不會被其他元素截斷
          popperPlacement="bottom-start"
          name={name}
          id={id}
          // 自定義CSS類名，適配 Tailwind CSS v4
          calendarClassName="bg-white rounded-lg shadow border border-gray-200"
          // 日期選擇器樣式
          dayClassName={(date) => 
            date && 
            selectedDate && 
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
              ? 'bg-green-500 text-white rounded-full hover:bg-green-600'
              : 'text-gray-700 hover:bg-gray-100 rounded-full'
          }
        />
      </div>
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DateTimePicker;
