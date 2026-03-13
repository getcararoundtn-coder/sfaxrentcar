import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL,
  withCredentials: true, // 🔥 إلزامي لإرسال الكوكيز
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 تأكيد إعدادات الكوكيز
API.defaults.withCredentials = true;

API.interceptors.request.use(
  (config) => {
    console.log('📤 Request:', config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

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