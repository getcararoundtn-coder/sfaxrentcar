import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const NotFound = () => {
  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.errorCode}>404</h1>
          <h2 style={styles.title}>الصفحة غير موجودة</h2>
          <p style={styles.message}>
            عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
          </p>
          <Link to="/" style={styles.button}>
            العودة إلى الرئيسية
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 60px - 300px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#f8f9fa'
  },
  content: {
    textAlign: 'center',
    maxWidth: '500px'
  },
  errorCode: {
    fontSize: '120px',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '0',
    lineHeight: '1'
  },
  title: {
    fontSize: '32px',
    color: '#333',
    marginBottom: '20px'
  },
  message: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6'
  },
  button: {
    display: 'inline-block',
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#0056b3'
    }
  }
};

export default NotFound;