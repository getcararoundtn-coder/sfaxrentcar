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

  // ربط حساب Firebase مع حساب محلي
  const linkFirebaseAccount = useCallback(async (firebaseUid, email, name, role) => {
    try {
      console.log('🔵 linkFirebaseAccount called with role:', role);
      console.log('🔵 Firebase UID:', firebaseUid);
      console.log('🔵 Email:', email);
      
      const { data } = await API.post('/auth/firebase-login', {
        firebaseUid,
        email,
        name,
        role
      });
      
      console.log('🔵 Firebase login response:', data);
      console.log('🔵 User role from firebase login:', data.data?.role);
      
      // ✅ التحقق: إذا كان هناك مستخدم مخزن محلياً والبريد مختلف، لا تقم بالتحديث
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.email && parsedUser.email !== data.data.email) {
            console.warn('⚠️ Email mismatch! Stored:', parsedUser.email, 'Received:', data.data.email);
            console.warn('⚠️ Not updating user to prevent account takeover');
            // لا نقوم بتحديث المستخدم إذا كان البريد مختلف
            return parsedUser;
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
      
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    } catch (err) {
      console.error('Firebase login error:', err);
      return null;
    }
  }, []);

  // تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
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

  // تسجيل الدخول بحساب Google
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

  // ✅ تسجيل الخروج
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔵 Logging out...');
      
      // 1. تسجيل الخروج من Firebase
      try {
        await logoutFirebase();
        console.log('✅ Firebase logout successful');
      } catch (firebaseErr) {
        console.error('Firebase logout error:', firebaseErr);
      }
      
      // 2. تسجيل الخروج من Backend
      try {
        const response = await API.post('/auth/logout');
        console.log('✅ Backend logout successful:', response.data);
      } catch (backendErr) {
        console.error('Backend logout error:', backendErr);
      }
      
      // 3. مسح البيانات المحلية
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('user');
      
      console.log('🔵 Logout completed, waiting for navigation');
    } catch (err) {
      console.error('❌ Logout error:', err);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ تعطيل onAuthStateChanged التلقائي لمنع التبديل العشوائي للمستخدمين
  // هذا هو السبب الرئيسي للمشكلة - عندما يتم تحديث الصفحة،
  // onAuthStateChanged كان يقوم بتسجيل الدخول تلقائياً بأي حساب Firebase موجود
  // ونحن الآن نعطله ونعتمد فقط على localStorage و fetchUser
  
  // ✅ نستخدم useEffect فقط لتحميل المستخدم من localStorage و fetchUser
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
          
          // التحقق من صحة التوكن
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
        // جلب المستخدم من الـ API إذا كان هناك كوكيز
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

  // ✅ لا نستخدم onAuthStateChanged التلقائي لأنه يسبب مشاكل
  // يمكن تفعيله إذا أردنا مزامنة Firebase مع الحالة، ولكن بحذر
  // تم تعطيله لمنع التبديل العشوائي للمستخدمين

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