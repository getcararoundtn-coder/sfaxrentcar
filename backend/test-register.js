const axios = require('axios');

const test = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'مستخدم تجريبي',
      email: 'test@test.com',
      password: '123456',
      phone: '12345678'
    });
    console.log('✅ تم التسجيل:', response.data);
  } catch (error) {
    console.log('❌ خطأ:', error.response?.data || error.message);
  }
};

test();
