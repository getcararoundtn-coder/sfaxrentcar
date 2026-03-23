import { createContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { auth, loginWithEmail, loginWithGoogle, logoutFirebase } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

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
        role // ✅ إضافة role
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

  // ✅ تسجيل الدخول بالبريد الإلكتروني وكلمة المرور (مع دعم الدور)
  const loginWithFirebaseEmail = useCallback(async (email, password, userRole) => {
    try {
      console.log('🔵 loginWithFirebaseEmail called with role:', userRole);
      const userCredential = await loginWithEmail(email, password);
      const firebaseUser = userCredential.user;
      
      // ربط مع Backend مع تمرير الدور
      const userData = await linkFirebaseAccount(
        firebaseUser.uid,
        firebaseUser.email,
        firebaseUser.displayName || firebaseUser.email.split('@')[0],
        userRole // ✅ تمرير الدور
      );
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Firebase login error:', error);
      return { success: false, error: error.message };
    }
  }, [linkFirebaseAccount]);

  // ✅ تسجيل الدخول بحساب Google (مع دعم الدور)
  const loginWithFirebaseGoogle = useCallback(async (userRole) => {
    try {
      console.log('🔵 loginWithFirebaseGoogle called with role:', userRole);
      const result = await loginWithGoogle();
      const firebaseUser = result.user;
      
      // ربط مع Backend مع تمرير الدور
      const userData = await linkFirebaseAccount(
        firebaseUser.uid,
        firebaseUser.email,
        firebaseUser.displayName,
        userRole // ✅ تمرير الدور
      );
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  }, [linkFirebaseAccount]);

  // تسجيل الخروج (من Firebase و Backend)
  const logout = useCallback(async () => {
    try {
      // تسجيل الخروج من Firebase
      await logoutFirebase();
      // تسجيل الخروج من Backend
      await API.post('/auth/logout');
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  // مراقبة حالة Firebase Auth (مع دعم الدور الافتراضي)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser && !user) {
        // إذا كان المستخدم مسجلاً في Firebase ولكن ليس في Backend
        // نستخدم دور افتراضي 'user' لأنه لا يوجد دور مخزن
        await linkFirebaseAccount(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName || firebaseUser.email.split('@')[0],
          'user' // ✅ دور افتراضي للمستخدمين الموجودين مسبقاً
        );
      }
    });
    
    return () => unsubscribe();
  }, [user, linkFirebaseAccount]);

  // جلب المستخدم من Backend عند تحميل الصفحة
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('🔵 Stored user from localStorage:', parsedUser);
        console.log('🔵 Stored user role:', parsedUser?.role);
        setUser(parsedUser);
        setLoading(false);
        fetchUser();
      } catch (e) {
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
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