# DiDi GO專案

## 專案目的

「DiDi GO」是一個專為台灣辦公環境設計的訂餐管理解決方案，旨在解決以下問題：

- 手動收集訂單的重複性工作
- 訂單整合與計算的錯誤
- 付款追蹤的困難
- 與餐廳溝通的繁瑣過程
- 訂單臨時變更的混亂

## 技術架構

### 前端架構

- 框架：Next.js 14+ + TypeScript（部署於 Vercel）
- CSS 框架：Tailwind CSS
- 路由：Next.js App Router
- 表單處理：react-hook-form
- 狀態管理：React Context API

### 其他工具

- 日期處理：date-fns + react-datepicker

### 後端架構

- 資料庫：Firebase Firestore（由 Firebase 提供）
- 身份驗證：Firebase Authentication（由 Firebase 提供）
- API 路由：Next.js 內建 Route Handlers

## 專案資料夾架構

為了保持專案的清晰性和可維護性，我們採用現代Next.js專案結構，將所有源代碼放在src/目錄下：

### 前端結構

```text
├── src/                  # 源代碼目錄
│   ├── app/              # Next.js App Router 應用結構
│   │   ├── api/          # API 路由處理
│   │   ├── login/        # 登入頁面
│   │   │   └── page.tsx  # 登入頁面元件
│   │   ├── register/     # 註冊頁面
│   │   │   └── page.tsx  # 註冊頁面元件
│   │   ├── restaurants/  # 餐廳相關頁面
│   │   │   │   ├── [restaurantId]
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── menu/ # 菜單頁面
│   │   │   │   │   └── page.tsx
│   │   │   └── page.tsx  # 餐廳列表頁面
│   │   ├── orders/       # 訂單相關頁面
│   │   │   │   ├── payments/ # 付款管理頁面
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── create/   # 建立訂單頁面
│   │   │   │   └── page.tsx
│   │   │   ├── history/  # 訂單歷史頁面
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx  # 訂單列表頁面
│   │   ├── share/        # 共享訂單頁面
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   ├── layout.tsx    # 根佈局元件
│   │   ├── page.tsx      # 首頁元件
│   │   └── globals.css   # 全域樣式
│   │
│   ├── components/       # 可重複使用的 UI 組件
│   │   ├── ui/           # 基礎UI元件
│   │   ├── forms/        # 表單相關元件
│   │   ├── layout/       # 佈局元件
│   │   └── feature/      # 功能特定元件
│   │
│   ├── styles/           # 其他樣式檔案
│   │
│   ├── utils/            # 工具函式
│   │   ├── firebase.ts   # Firebase相關函式
│   │   ├── date.ts       # 日期處理函式
│   │   └── validation.ts # 資料驗證
│   │
│   ├── hooks/            # 自定義Hooks
│   │   ├── useAuth.ts    # 認證相關hook
│   │   └── useOrders.ts  # 訂單相關hook
│   │
│   ├── context/          # Context API
│   │   ├── AuthContext.tsx # 認證狀態管理
│   │   └── OrderContext.tsx # 訂單狀態管理
│   │
│   ├── type/             # TypeScript 型別定義
│   │   ├── index.ts      # 統一匯出
│   │   ├── common.ts     # 共用型別
│   │   ├── user.ts       # 使用者相關型別
│   │   ├── restaurant.ts # 餐廳相關型別
│   │   ├── order.ts      # 訂單相關型別
│   │   └── firebase.ts   # Firebase相關型別
│   │
│   ├── lib/              # 第三方庫的整合
│   │   └── firebase.ts   # Firebase配置
│   │
│   └── services/         # 服務層
│       ├── auth.ts       # 認證服務
│       ├── restaurant.ts # 餐廳服務
│       └── order.ts      # 訂單服務
│
├── public/               # 靜態資源
│   ├── images/           # 圖片資源
│   ├── icons/            # 圖標資源
│   └── favicon.ico       # 網站圖標
│
├── next.config.js        # Next.js 配置
├── tailwind.config.js    # Tailwind 配置
├── tsconfig.json         # TypeScript 配置
├── .env.local            # 環境變數 (本地開發)
└── .env.production       # 環境變數 (生產環境)
```

### 後端結構

```text
# Firebase 架構
└── Firebase 專案
    ├── Authentication     # 使用者驗證服務
    └── Firestore 資料庫
        ├── users          # 使用者資料集合
        │   └── {uid}     # 使用者文件
        │       ├── email
        │       ├── displayName
        │       ├── phoneNumber
        │       ├── role
        │       └── settings
        │
        ├── restaurants    # 餐廳資料集合
        │   └── {id}      # 餐廳文件（Firebase 自動生成文檔ID）
        │       ├── name
        │       ├── description
        │       ├── address
        │       ├── contact
        │       ├── category
        │       └── menu_items  # 子集合
        │           └── {id}   # 菜單項目文件（Firebase 自動生成文檔ID）
        │               ├── name
        │               ├── price
        │               ├── description
        │               └── options
        │
        └── orders        # 訂單資料集合
            └── {id}      # 訂單文件（Firebase 自動生成文檔ID）
                ├── organizerId
                ├── title
                ├── status
                ├── deadlineTime
                ├── totalAmount
                ├── paymentStatus
                └── order_items  # 子集合
                    └── {id}    # 訂單項目文件（Firebase 自動生成文檔ID）
                        ├── userId
                        ├── menuItemId
                        ├── quantity
                        ├── unitPrice
                        ├── subtotal
                        └── isPaid
```

## 主要使用流程

1. 用戶登入/註冊
2. 首頁
3. 餐廳與菜單管理
4. 餐廳選擇與訂單狀態設定
5. 建立訂餐表單
6. 分享訂餐連結給同事
7. 監控訂餐表單狀態
8. 提交最終訂單
9. 追蹤付款狀態
10. 完成訂單歸檔

## UI 設計風格

「DiDi GO」採用現代簡潔的設計風格，著重於使用者體驗和視覺一致性。
設計風格的核心目標是創造一個視覺愉悅、使用直觀且具有一致性的用戶界面，幫助用戶專注於訂餐管理的核心任務，而非被界面複雜性分散注意力。

### 色彩系統

- **主色調**: #10B981 (綠色) - 用於主要按鈕、當前選中項目和重要操作
- **輔助色**: #E5E7EB (淺灰色) - 用於次要操作和輔助元素
- **強調色**: #3B82F6 (藍色) - 用於重要信息和導航元素
- **警示色**: #FFB400 (黃色) - 用於提醒、等待狀態和警告信息
- **危險色**: #EF4444 (紅色) - 用於刪除或危險操作
- **中性色**:
  - #484848 (深灰) - 用於主要文字內容
  - #767676 (中灰) - 用於次要文字內容
  - #F7F7F7 (淺灰) - 用於背景和分隔區域

### 元素風格

- **卡片設計**: 白色背景、8px 圓角、輕微陰影 `box-shadow: 0 2px 8px rgba(0,0,0,0.1)`
- **按鈕風格**: 圓角設計，提供視覺反饋，主色系填充
- **狀態標示**: 使用顏色編碼區分不同狀態，搭配圖標增強辨識度
- **間距規則**: 遵循 8px 網格系統 (8px, 16px, 24px, 32px)

### 排版規範

- **標題**: 18-24px，粗體，#484848
- **內文**: 14-16px，一般字重，#484848
- **輔助文字**: 12-14px，一般字重，#767676

### 響應式設計

- 考慮電腦端與手機端都有良好的使用者體驗
- 卡片式設計在不同螢幕尺寸下自適應排列
- 關鍵操作按鈕（如新增訂單）使用懸浮按鈕設計，確保易於觸及
