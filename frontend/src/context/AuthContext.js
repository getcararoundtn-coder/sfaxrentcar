import { createContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { auth, loginWithEmail, loginWithGoogle, logoutFirebase } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // جلب المستخدم من Backend
  const fetchUser = useCallback(async () => {
    try {
      const { data } = await API.get('/auth/me');
      console.log('🔵 fetchUser response:', data);
      console.log('🔵 User role from backend:', data.data?.role);
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    } catch (err) {
      console.error('Not authenticated');
      setUser(null);
      localStorage.removeItem('user');
      return null;
    }
  }, []);

  // ✅ ربط حساب Firebase مع حساب محلي (مع دعم الدور)
  const linkFirebaseAccount = useCallback(async (firebaseUid, email, name, role) => {
    try {
      console.log('🔵 linkFirebaseAccount called with role:', role);
      const { data } = await API.post('/auth/firebase-login', {
        firebaseUid,
        email,
        name,
        role
      });
      console.log('🔵 Firebase login response:', data);
      console.log('🔵 User role from firebase login:', data.data?.role);
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    } catch (err) {
      console.error('Firebase login error:', err);
      return null;
    }
  }, []);

  // ✅ تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
  const loginWithFirebaseEmail = useCallback(async (email, password, userRole) => {
    try {
      console.log('🔵 loginWithFirebaseEmail called with role:', userRole);
      const userCredential = await loginWithEmail(email, password);
      const firebaseUser = userCredential.user;
      
      const userData = await linkFirebaseAccount(
        firebaseUser.uid,
        firebaseUser.email,
        firebaseUser.displayName || firebaseUser.email.split('@')[0],
        userRole
      );
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Firebase login error:', error);
      return { success: false, error: error.message };
    }
  }, [linkFirebaseAccount]);

  // ✅ تسجيل الدخول بحساب Google
  const loginWithFirebaseGoogle = useCallback(async (userRole) => {
    try {
      console.log('🔵 loginWithFirebaseGoogle called with role:', userRole);
      const result = await loginWithGoogle();
      const firebaseUser = result.user;
      
      const userData = await linkFirebaseAccount(
        firebaseUser.uid,
        firebaseUser.email,
        firebaseUser.displayName,
        userRole
      );
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  }, [linkFirebaseAccount]);

  // تسجيل الخروج
  const logout = useCallback(async () => {
    try {
      await logoutFirebase();
      await API.post('/auth/logout');
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('user');
      // ✅ إعادة التوجيه إلى الصفحة الرئيسية بعد الخروج
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  // ✅ مراقبة حالة Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser && !user && !authChecked) {
        await linkFirebaseAccount(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName || firebaseUser.email.split('@')[0],
          'user'
        );
      }
    });
    
    return () => unsubscribe();
  }, [user, linkFirebaseAccount, authChecked]);

  // ✅ جلب المستخدم من Backend عند تحميل الصفحة
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔵 Stored user from localStorage:', parsedUser);
          console.log('🔵 Stored user role:', parsedUser?.role);
          setUser(parsedUser);
          
          // ✅ التحقق من صحة التوكن
          const userData = await fetchUser();
          if (!userData) {
            setUser(null);
            localStorage.removeItem('user');
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        // ✅ جلب المستخدم من الـ API إذا كان هناك كوكيز
        const userData = await fetchUser();
        if (!userData) {
          console.log('No authenticated user found');
        }
      }
      setAuthChecked(true);
      setLoading(false);
    };
    
    initAuth();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      authChecked,
      logout, 
      fetchUser,
      loginWithFirebaseEmail,
      loginWithFirebaseGoogle,
      firebaseUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};