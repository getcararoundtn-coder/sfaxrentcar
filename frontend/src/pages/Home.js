import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import API from '../services/api';
console.log('✅ This is the simplified Home.js version');

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#667eea',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          استأجر سيارتك المفضلة بسهولة وسرعة
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
          منصة تونسية لكراء السيارات بين الأفراد والشركات
        </p>
        
        {!user ? (
          <Link 
            to="/register" 
            style={{
              padding: '15px 40px',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            ابدأ الآن
          </Link>
        ) : (
          <p style={{ fontSize: '2rem' }}>مرحباً بعودتك، {user.name}</p>
        )}
      </div>
    </>
  );
};

export default Home;