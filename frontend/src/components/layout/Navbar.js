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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* الشعار مع أيقونة الإشعارات */}
        <div className="logo-section">
          <Link to="/" className="logo-link" onClick={closeMenus}>
            {settings?.platformName || 'DriveTunisia'}
          </Link>
          {/* أيقونة الإشعارات بجانب الاسم */}
          {user && (
            <div className="notification-bell-inline">
              <NotificationBell />
            </div>
          )}
        </div>

        {/* ========== قائمة سطح المكتب (Desktop) ========== */}
        <div className="desktop-menu">
          {/* Louer ma voiture - زر بنفسجي مميز */}
          <Link to={user ? "/add-car" : "/register"} className="rent-button">
            Louer ma voiture
          </Link>
          
          {/* Se connecter / Mon compte */}
          {!user ? (
            <Link to="/login" className="login-link">
              Se connecter
            </Link>
          ) : (
            <div className="user-menu-container">
              <button className="user-menu-button" onClick={toggleUserMenu}>
                Mon compte ▼
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" onClick={closeMenus}>Mon profil</Link>
                  <Link to="/my-bookings" onClick={closeMenus}>Mes réservations</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={closeMenus}>Admin</Link>
                  )}
                  <button onClick={handleLogout} className="logout-btn">Se déconnecter</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========== زر Menu ☰ للهاتف (Mobile) ========== */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          ☰
        </button>

        {/* ========== القائمة المنسدلة للهاتف ========== */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {/* Louer ma voiture - زر بنفسجي مميز */}
              <Link 
                to={user ? "/add-car" : "/register"} 
                className="mobile-rent-button"
                onClick={closeMenus}
              >
                Louer ma voiture
              </Link>
              
              {/* Se connecter - يظهر فقط إذا لم يكن مسجلاً */}
              {!user && (
                <Link to="/login" className="mobile-link" onClick={closeMenus}>
                  Se connecter
                </Link>
              )}
              
              {/* روابط إضافية للمستخدمين المسجلين */}
              {user && (
                <>
                  <Link to="/profile" className="mobile-link" onClick={closeMenus}>
                    Mon profil
                  </Link>
                  <Link to="/my-bookings" className="mobile-link" onClick={closeMenus}>
                    Mes réservations
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="mobile-link" onClick={closeMenus}>
                      Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    Se déconnecter
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;