import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { styles } from '../../styles/homeStyles';

const Navbar = ({ onSearch }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fuelType: '',
    minSeats: '',
    maxPrice: '',
    ownerType: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // جلب دور المستخدم من localStorage (تم تخزينه عند اختيار الدور)
        const role = localStorage.getItem('userRole') || 'individual';
        setUserRole(role);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ searchTerm, ...filters });
    setShowFilters(false);
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #ddd',
      flexWrap: 'wrap',
      position: 'relative',
      zIndex: 1000,
    }}>
      {/* Logo والروابط الرئيسية */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', textDecoration: 'none' }}>
          SfaxRentCar
        </Link>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>الرئيسية</Link>
          <Link to="/cars" style={{ textDecoration: 'none', color: '#333' }}>السيارات</Link>
          <Link to="/companies" style={{ textDecoration: 'none', color: '#333' }}>الشركات</Link>
          <Link to="/about" style={{ textDecoration: 'none', color: '#333' }}>حول</Link>
        </div>
      </div>

      {/* نموذج البحث والفلترة */}
      <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '600px', margin: '0 20px' }}>
        <input
          type="text"
          placeholder="ابحث عن سيارة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          بحث
        </button>
        <button type="button" onClick={() => setShowFilters(!showFilters)} style={{ padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          فلترة
        </button>
      </form>

      {/* نافذة الفلترة المنبثقة */}
      {showFilters && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          width: '400px',
        }}>
          <h4 style={{ margin: '0 0 15px 0' }}>بحث متقدم</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <select
              value={filters.fuelType}
              onChange={(e) => setFilters({...filters, fuelType: e.target.value})}
              style={styles.filterSelect}
            >
              <option value="">كل أنواع الوقود</option>
              <option value="petrol">بنزين</option>
              <option value="diesel">ديزل</option>
              <option value="electric">كهرباء</option>
              <option value="hybrid">هايبرد</option>
            </select>
            <input
              type="number"
              placeholder="أقل عدد مقاعد"
              value={filters.minSeats}
              onChange={(e) => setFilters({...filters, minSeats: e.target.value})}
              style={styles.filterInput}
            />
            <input
              type="number"
              placeholder="أقصى سعر (دينار)"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              style={styles.filterInput}
            />
            <select
              value={filters.ownerType}
              onChange={(e) => setFilters({...filters, ownerType: e.target.value})}
              style={styles.filterSelect}
            >
              <option value="">كل المالكين</option>
              <option value="individual">أفراد</option>
              <option value="professional">شركات</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
            <button onClick={handleSearch} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              تطبيق
            </button>
          </div>
        </div>
      )}

      {/* قسم المستخدم */}
      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>مرحباً، {user.displayName || user.email}</span>
            <Link to="/profile" style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>الملف الشخصي</Link>
            {userRole === 'professional' && (
              <Link to="/add-car" style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>إضافة سيارة</Link>
            )}
            <button onClick={handleLogout} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>تسجيل الخروج</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" style={{ padding: '5px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>تسجيل الدخول</Link>
            <Link to="/register" style={{ padding: '5px 15px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>التسجيل</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;