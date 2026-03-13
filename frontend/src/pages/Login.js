import React, { useContext } from 'react';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Login = () => {
  const { user } = useContext(AuthContext);
  
  // اختبار بسيط للتأكد من أن API يعمل
  console.log('API Base URL:', API.defaults.baseURL);
  
  return (
    <>
      <Navbar />
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>صفحة تسجيل دخول مع API</h1>
        <p>المستخدم: {user ? user.name : 'غير مسجل'}</p>
        <p>افتح Console (F12) لترى رابط API</p>
      </div>
    </>
  );
};

export default Login;