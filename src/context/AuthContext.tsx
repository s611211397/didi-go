'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User as AppUser } from '@/type';
import { 
  signInWithEmailAndPassword, 
  signInWithGoogle, 
  registerWithEmailAndPassword, 
  signOut, 
  resetPassword,
  onAuthStateChange
} from '../services/auth';

interface AuthContextType {
  currentUser: User | null;
  userProfile: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (email: string, password: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 獲取用戶資料
  const fetchUserProfile = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile({ 
          id: userDoc.id, 
          ...userDoc.data() 
        } as AppUser);
      } else {
        console.warn('用戶資料不存在');
      }
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
    }
  };

  // 監聽認證狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 登入
  const login = async (email: string, password: string) => {
    const user = await signInWithEmailAndPassword(email, password);
    await fetchUserProfile(user);
    return user;
  };

  // Google 登入
  const loginWithGoogle = async () => {
    const user = await signInWithGoogle();
    await fetchUserProfile(user);
    return user;
  };

  // 註冊
  const register = async (email: string, password: string, displayName: string) => {
    const user = await registerWithEmailAndPassword(email, password, displayName);
    await fetchUserProfile(user);
    return user;
  };

  // 登出
  const logout = async () => {
    await signOut();
    setUserProfile(null);
  };

  // 重設密碼
  const resetUserPassword = async (email: string) => {
    await resetPassword(email);
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    resetUserPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}