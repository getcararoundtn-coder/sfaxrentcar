import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SettingsContext } from '../../context/SettingsContext';
import NotificationBell from '../NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            {settings?.platformName || 'SfaxRentCar'}
          </Link>
        </div>

        <button className="menu-button" onClick={toggleMobileMenu}>
          ☰
        </button>

        <div className="nav-links desktop-links">
          <Link to="/" className="nav-link">الرئيسية</Link>
          <Link to="/cars" className="nav-link">السيارات</Link>
          {user && <Link to="/my-bookings" className="nav-link">حجوزاتي</Link>}
          {user && <Link to="/owner-cars" className="nav-link">سياراتي</Link>}
          <Link to="/about" className="nav-link">من نحن</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link">لوحة المشرف</Link>
          )}
        </div>

        <div className="user-section desktop-user-section">
          {user ? (
            <>
              <NotificationBell />
              <span className="user-name">مرحباً، {user.name}</span>
              <Link to="/profile" className="profile-link">الملف الشخصي</Link>
              {user.verificationStatus === 'approved' && (
                <Link to="/add-car" className="add-car-link">إضافة سيارة</Link>
              )}
              <button onClick={handleLogout} className="logout-btn">
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">تسجيل الدخول</Link>
              <Link to="/register" className="register-link">التسجيل</Link>
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={toggleMobileMenu}>الرئيسية</Link>
          <Link to="/cars" className="mobile-link" onClick={toggleMobileMenu}>السيارات</Link>
          {user && (
            <>
              <Link to="/my-bookings" className="mobile-link" onClick={toggleMobileMenu}>حجوزاتي</Link>
              <Link to="/owner-cars" className="mobile-link" onClick={toggleMobileMenu}>سياراتي</Link>
            </>
          )}
          <Link to="/about" className="mobile-link" onClick={toggleMobileMenu}>من نحن</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="mobile-link" onClick={toggleMobileMenu}>لوحة المشرف</Link>
          )}
          
          <div className="mobile-user-section">
            {user ? (
              <>
                <NotificationBell />
                <span className="mobile-user-name">مرحباً، {user.name}</span>
                <Link to="/profile" className="mobile-profile-link" onClick={toggleMobileMenu}>الملف الشخصي</Link>
                {user.verificationStatus === 'approved' && (
                  <Link to="/add-car" className="mobile-add-car-link" onClick={toggleMobileMenu}>إضافة سيارة</Link>
                )}
                <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="mobile-logout-btn">
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="mobile-login-link" onClick={toggleMobileMenu}>تسجيل الدخول</Link>
                <Link to="/register" className="mobile-register-link" onClick={toggleMobileMenu}>التسجيل</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;