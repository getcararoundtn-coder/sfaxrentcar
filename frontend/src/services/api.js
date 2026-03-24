import axios from 'axios';

// ✅ تعيين الرابط مباشرة (مؤقت للاختبار)
const baseURL = 'https://sfaxrentcar-backend.onrender.com/api';

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 60000
});

// ✅ اعتراض الطلبات للتأكد من إرسال الكوكيز
API.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    config.withCredentials = true;
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ✅ اعتراض الردود
API.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message === 'timeout of 60000ms exceeded') {
      console.error('❌ Request timeout');
    } else if (error.response) {
      console.error(`❌ API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('🔴 Unauthorized - Session expirée');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
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