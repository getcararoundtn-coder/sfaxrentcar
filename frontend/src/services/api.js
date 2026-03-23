import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ✅ إعدادات Axios المتوافقة مع Safari و iPhone
const API = axios.create({
  baseURL,
  withCredentials: true, // ✅ مهم جداً لإرسال الكوكيز (خاصة لـ Safari)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 30000 // 30 secondes timeout
});

// ✅ اعتراض الطلبات للتأكد من إرسال الكوكيز
API.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    
    // ✅ للتأكد من أن withCredentials صحيح
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ✅ اعتراض الردود لمعالجة الأخطاء
API.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      
      // إذا كانت 401 (غير مصرح) أو 403 (ممنوع)
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('🔴 Unauthorized - Session expirée');
        
        // ✅ إزالة بيانات المستخدم المحلية
        localStorage.removeItem('user');
        
        // ✅ إذا كان المستخدم في صفحة تتطلب تسجيل دخول، نعيده إلى login
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          console.log('🔐 Redirection vers login...');
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('❌ No response from server:', error.request);
    } else {
      console.error('❌ Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;