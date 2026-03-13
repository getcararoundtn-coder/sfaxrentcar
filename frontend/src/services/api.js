import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 **Interceptor مهم جداً لإضافة التوكن إلى كل طلب**
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('📤 Request:', config.url, 'Token:', token ? '✅ موجود' : '❌ غير موجود');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor للردود
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔴 Unauthorized - قد يكون التوكن منتهياً');
      // لا تحذف التوكن فوراً، فقط سجل الخطأ
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default API;