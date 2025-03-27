// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// 引入 Analytics (如果需要)
// import { getAnalytics, isSupported } from "firebase/analytics";

// 從環境變數讀取 Firebase 配置
// process.env 會自動被 Next.js 替換為 .env.local 中的值
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // 如果您有 measurementId，取消下面這行的註解
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 初始化 Firebase App
// 透過檢查 getApps().length 來避免在開發模式下重複初始化
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 取得 Firebase 服務實例
const auth = getAuth(app); // 身份驗證服務
const db = getFirestore(app); // Firestore 資料庫服務

// 取得 Analytics 實例 (如果需要且支援)
// let analytics;
// if (typeof window !== 'undefined') { // 確保在客戶端執行
//   isSupported().then((supported) => {
//     if (supported) {
//       analytics = getAnalytics(app);
//     }
//   });
// }

// 匯出所需的實例，以便在其他地方使用
export { app, auth, db };
// 如果需要 Analytics，也匯出 analytics
// export { app, auth, db, analytics };