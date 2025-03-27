import { useAuth as useAuthContext } from '@/context/AuthContext';

/**
 * 認證 Hook
 * 提供認證相關功能的便捷訪問
 */
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;