import React, { useContext } from 'react';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <>
      <Navbar />
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>صفحة تسجيل دخول مع AuthContext</h1>
        <p>المستخدم: {user ? user.name : 'غير مسجل'}</p>
      </div>
    </>
  );
};

export default Login;