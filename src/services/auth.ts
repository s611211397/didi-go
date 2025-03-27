import { 
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    onAuthStateChanged,
    User
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
  import { auth, db } from '@/lib/firebase';
  import { UserRole } from '@/type/user';
  
  // 使用電子信箱和密碼登入
  export const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('登入失敗:', error);
      throw error;
    }
  };
  
  // 使用 Google 登入
  export const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // 檢查用戶是否已存在
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      // 如果用戶不存在，創建新用戶記錄
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName || '用戶',
          photoURL: user.photoURL,
          role: UserRole.USER,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      
      return user;
    } catch (error) {
      console.error('Google 登入失敗:', error);
      throw error;
    }
  };
  
  // 註冊新用戶
  export const registerWithEmailAndPassword = async (
    email: string, 
    password: string, 
    displayName: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 創建用戶資料
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName,
        role: UserRole.USER,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return user;
    } catch (error) {
      console.error('註冊失敗:', error);
      throw error;
    }
  };
  
  // 登出
  export const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('登出失敗:', error);
      throw error;
    }
  };
  
  // 密碼重設
  export const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('密碼重設失敗:', error);
      throw error;
    }
  };
  
  // 監聽認證狀態變化
  export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  };