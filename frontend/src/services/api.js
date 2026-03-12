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

// يمكن إضافة interceptors لمعالجة الأخطاء بشكل موحد (اختياري)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // معالجة أخطاء المصادقة (مثل 401) - يمكنك توجيه المستخدم إلى صفحة تسجيل الدخول
    if (error.response?.status === 401) {
      // يمكنك هنا إعادة توجيه المستخدم أو تحديث الـ state
      console.log('Unauthorized - redirect to login');
    }
    return Promise.reject(error);
  }
);

export default API;