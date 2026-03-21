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
            {settings?.platformName || 'SfaxRentCar'}
          </Link>
        </div>

        {/* زر Menu ☰ */}
        <button className="menu-button" onClick={toggleMenu}>
          ☰
        </button>

        {/* القائمة المنسدلة */}
        {menuOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-content">
              {/* Se connecter - يظهر فقط إذا لم يكن مسجلاً */}
              {!user && (
                <Link to="/login" className="dropdown-link" onClick={closeMenu}>
                  Se connecter
                </Link>
              )}
              
              {/* Louer ma voiture */}
              <Link to={user ? "/add-car" : "/register"} className="dropdown-link" onClick={closeMenu}>
                Louer ma voiture
              </Link>
              
              {/* روابط إضافية للمستخدمين المسجلين */}
              {user && (
                <>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-link" onClick={closeMenu}>
                    Mon profil
                  </Link>
                  <Link to="/my-bookings" className="dropdown-link" onClick={closeMenu}>
                    Mes réservations
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-link" onClick={closeMenu}>
                      Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-logout-btn">
                    Se déconnecter
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* إشعارات للمستخدمين المسجلين فقط - تظهر بجانب الزر */}
        {user && (
          <div className="notification-wrapper">
            <NotificationBell />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;