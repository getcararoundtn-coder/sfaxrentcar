import React from 'react';
import Navbar from '../components/layout/Navbar';

const Login = () => {
  return (
    <>
      <Navbar />
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>صفحة تسجيل دخول مع Navbar</h1>
        <p>إذا ظهرت هذه الصفحة مع Navbar، فالمشكلة ليست في Navbar</p>
      </div>
    </>
  );
};

export default Login;