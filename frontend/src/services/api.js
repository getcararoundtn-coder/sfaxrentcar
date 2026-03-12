import axios from 'axios';

// استخدام متغير البيئة لتحديد عنوان API
// في بيئة التطوير المحلي: http://localhost:5000/api
// في بيئة الإنتاج: عنوان الـ backend المنشور (مثل https://sfaxrentcar-backend.onrender.com/api)
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL,
  withCredentials: true, // ضروري لإرسال واستقبال httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 **مهم جداً: Interceptor لإضافة التوكن إلى كل طلب**
API.interceptors.request.use(
  (config) => {
    // جلب التوكن من localStorage
    const token = localStorage.getItem('token');
    
    // إذا كان التوكن موجوداً، أضفه إلى رأس Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to request:', config.url);
    } else {
      console.log('⚠️ No token found for request:', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor للردود (للمعالجة الموحدة للأخطاء)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // معالجة أخطاء المصادقة (مثل 401)
    if (error.response?.status === 401) {
      console.log('🔴 Unauthorized - redirect to login');
      
      // يمكنك إزالة التوكن إذا كان منتهياً
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // إذا لم يكن المستخدم في صفحة تسجيل الدخول، يمكن إعادة توجيهه
      // يمكن تفعيل هذا السطر إذا أردت
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;