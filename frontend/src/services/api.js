import axios from 'axios';

// ✅ استخدام المتغير البيئي أو المحلي
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      
      // ✅ لا تقم بتسجيل الخروج تلقائياً - فقط للـ 401 من endpoints محددة
      // قم بإزالة هذا السطر أو التعليق عليه
      // if (error.response.status === 401) {
      //   localStorage.removeItem('user');
      //   window.location.href = '/';
      // }
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;