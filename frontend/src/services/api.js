import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL,
  withCredentials: true, // مهم جداً لإرسال الكوكيز
  headers: {
    'Content-Type': 'application/json',
  },
});

// اعتراض الطلبات للتأكد من إرسال الكوكيز
API.interceptors.request.use(
  (config) => {
    console.log('📤 Request:', config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// اعتراض الردود لمعالجة الأخطاء
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔴 Unauthorized - يرجى تسجيل الدخول');
    }
    return Promise.reject(error);
  }
);

export default API;