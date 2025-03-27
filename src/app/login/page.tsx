'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const LoginPage = () => {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('請輸入電子信箱和密碼');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      console.error('登入失敗:', err);
      
      // 根據 Firebase 錯誤代碼提供友好的錯誤訊息
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        setError('登入失敗，請確認您的電子信箱和密碼');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('無效的電子信箱格式');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('登入嘗試次數過多，請稍後再試');
      } else {
        setError('登入時發生錯誤，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await loginWithGoogle();
      router.push('/');
    } catch (err) {
      console.error('Google 登入失敗:', err);
      
      // 根據 Firebase 錯誤代碼提供友好的錯誤訊息
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        setError('登入視窗已關閉，請再試一次');
      } else if (firebaseError.code === 'auth/cancelled-popup-request') {
        // 這只是用戶取消了彈窗，不需要顯示錯誤
        console.log('使用者取消了登入');
      } else {
        setError('Google 登入失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        {/* 卡片設計: 白色背景、8px 圓角、輕微陰影 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* 標誌與應用名稱 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {/* 這裡可以放置應用 Logo */}
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">點點GO+</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">點點 GO+</h1>
            <p className="text-gray-600 mt-2">訂餐團購一手搞定
            </p>
          </div>
          
          {/* 錯誤訊息 */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* 登入表單 */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="電子信箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="請輸入您的電子信箱"
              disabled={loading}
              required
            />
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  密碼
                </label>
                <Link 
                  href="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  忘記密碼?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入您的密碼"
                disabled={loading}
                required
              />
            </div>
            
            {/* 登入按鈕 */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
            >
              {loading ? '登入中...' : '登入'}
            </Button>
          </form>
                    
          <Button
            variant="outline"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={loading}
            leftIcon={
              <svg viewBox="0 0 24 24" width="18" height="18">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
            }
            className="mt-4"
          >
            使用 Google 帳號登入
          </Button>
          
          {/* 註冊連結 */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">還沒有帳號？</span>
            <Link 
              href="/register" 
              className="ml-1 text-green-600 hover:text-green-800 font-medium"
            >
              立即註冊
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;