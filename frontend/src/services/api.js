import axios from 'axios';

// ✅ استخدام المتغير البيئي أو المحلي
// في Render، يجب تعيين REACT_APP_API_URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://sfaxrentcar-backend.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // ✅ زيادة timeout إلى 60 ثانية
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
    console.log(`   BaseURL: ${config.baseURL}`);
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
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
      console.error('   This might be a CORS issue or server not responding');
    } else {
      console.error('❌ Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;