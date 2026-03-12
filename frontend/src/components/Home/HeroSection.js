import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HeroSection = ({ user }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // بناء رابط البحث مع المعايير
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (searchLocation) params.append('location', searchLocation);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div style={styles.hero}>
      <div style={styles.overlay}>
        <h1 style={styles.title}>استأجر سيارتك المفضلة بسهولة وسرعة</h1>
        <p style={styles.subtitle}>منصة تونسية لكراء السيارات بين الأفراد والشركات</p>
        
        {/* شريط البحث */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="ابحث عن ماركة أو موديل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <input
            type="text"
            placeholder="الموقع (اختياري)"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>بحث</button>
        </form>

        {/* حالة التحقق للمستخدم المسجل */}
        {user && user.status !== 'approved' && (
          <div style={styles.verificationBanner}>
            <span>حسابك {user.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}. </span>
            <Link to="/profile" style={styles.verificationLink}>عرض التفاصيل</Link>
          </div>
        )}

        <div style={styles.buttons}>
          <Link to="/cars" style={styles.buttonPrimary}>استعرض السيارات</Link>
          {user ? (
            <Link to="/add-car" style={styles.buttonSecondary}>إضافة سيارة</Link>
          ) : (
            <Link to="/register" style={styles.buttonSecondary}>ابدأ الآن</Link>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  hero: {
    backgroundImage: `url('/images/herocar.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '500px',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    textAlign: 'center',
    padding: '20px',
  },
  title: { fontSize: '48px', marginBottom: '15px' },
  subtitle: { fontSize: '20px', marginBottom: '30px' },
  searchForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  searchInput: {
    padding: '12px',
    borderRadius: '4px',
    border: 'none',
    width: '250px',
    fontSize: '16px',
  },
  searchButton: {
    padding: '12px 24px',
    backgroundColor: '#ffc107',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#333',
  },
  verificationBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '10px 20px',
    borderRadius: '4px',
    marginBottom: '20px',
    backdropFilter: 'blur(5px)',
  },
  verificationLink: {
    color: '#ffc107',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  buttons: { display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' },
  buttonPrimary: {
    padding: '12px 30px',
    backgroundColor: 'white',
    color: '#007bff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  buttonSecondary: {
    padding: '12px 30px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
};

export default HeroSection;