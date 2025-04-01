'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RouteTransitionProps {
  children: React.ReactNode;
}

/**
 * 路由過渡組件
 * 確保頁面在完全準備好內容後才顯示，避免白底閃爍問題
 */
const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState<React.ReactNode>(children);
  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  // 路由變更處理
  useEffect(() => {
    // 當路徑或查詢參數變更時
    const handleRouteChange = () => {
      // 如果這是首次載入，直接顯示當前頁面
      if (prevPathname === null) {
        setPrevPathname(pathname);
        setCurrentPage(children);
        return;
      }

      // 如果路由變更，保持當前頁面內容不變，直到新頁面準備好
      if (prevPathname !== pathname) {
        // 短暫延遲後更新頁面內容，確保新頁面已經準備好渲染
        const timer = setTimeout(() => {
          setCurrentPage(children);
          setPrevPathname(pathname);
        }, 300); // 調整時間以確保頁面內容已加載完成
        
        return () => clearTimeout(timer);
      } else {
        // 如果只是查詢參數變更，直接更新頁面內容
        setCurrentPage(children);
      }
    };

    handleRouteChange();
  }, [children, pathname, searchParams, prevPathname]);

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {currentPage}
    </div>
  );
};

export default RouteTransition;