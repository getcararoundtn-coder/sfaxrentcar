const axios = require('axios');

const test = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@test.com',
      password: '123456'
    });
    console.log('✅ نجاح تسجيل الدخول:', response.data);
  } catch (error) {
    console.log('❌ خطأ:', error.response?.data || error.message);
  }
};

test();