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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <Link to="/" className="logo-link" onClick={closeMenu}>
            {settings?.platformName || 'DriveTunisia'}
          </Link>
        </div>

        {/* قائمة سطح المكتب (Desktop) */}
        <div className="desktop-menu">
          {/* Louer ma voiture - زر مميز */}
          <Link to={user ? "/add-car" : "/register"} className="rent-button">
            Louer ma voiture
          </Link>
          
          {/* Se connecter / Mon compte */}
          {!user ? (
            <Link to="/login" className="login-link">
              Se connecter
            </Link>
          ) : (
            <div className="user-menu">
              <button className="user-menu-button" onClick={toggleMenu}>
                Mon compte ▼
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" onClick={closeMenu}>Mon profil</Link>
                  <Link to="/my-bookings" onClick={closeMenu}>Mes réservations</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={closeMenu}>Admin</Link>
                  )}
                  <button onClick={handleLogout} className="logout-btn">Se déconnecter</button>
                </div>
              )}
            </div>
          )}
          
          {/* إشعارات للمستخدمين المسجلين */}
          {user && (
            <div className="notification-wrapper">
              <NotificationBell />
            </div>
          )}
        </div>

        {/* زر Menu ☰ للهاتف (Mobile) */}
        <button className="menu-button" onClick={toggleMenu}>
          ☰
        </button>

        {/* القائمة المنسدلة للهاتف */}
        {menuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {/* Louer ma voiture - زر مميز */}
              <Link to={user ? "/add-car" : "/register"} className="mobile-rent-button" onClick={closeMenu}>
                Louer ma voiture
              </Link>
              
              {/* Se connecter - يظهر فقط إذا لم يكن مسجلاً */}
              {!user && (
                <Link to="/login" className="mobile-link" onClick={closeMenu}>
                  Se connecter
                </Link>
              )}
              
              {/* روابط إضافية للمستخدمين المسجلين */}
              {user && (
                <>
                  <Link to="/profile" className="mobile-link" onClick={closeMenu}>
                    Mon profil
                  </Link>
                  <Link to="/my-bookings" className="mobile-link" onClick={closeMenu}>
                    Mes réservations
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="mobile-link" onClick={closeMenu}>
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