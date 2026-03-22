import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SettingsContext } from '../../context/SettingsContext';
import NotificationBell from '../NotificationBell';
import Modal from '../Modal';
import API from '../../services/api';
import { showSuccess, showError } from '../../utils/ToastConfig';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    // ✅ إغلاق أي مودال مفتوح عند تسجيل الخروج
    setShowLoginModal(false);
    setShowRegisterModal(false);
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

  // Login handlers
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', loginData);
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        showSuccess('✅ تم تسجيل الدخول بنجاح');
        setShowLoginModal(false);
        setLoginData({ email: '', password: '' });
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'فشل تسجيل الدخول');
      showError(err.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // Register handlers
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const response = await API.post('/auth/register', registerData);
      if (response.data.success) {
        showSuccess('✅ تم إنشاء الحساب بنجاح');
        setShowRegisterModal(false);
        setRegisterData({ name: '', email: '', password: '', phone: '', role: 'user' });
        setShowLoginModal(true);
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'فشل إنشاء الحساب');
      showError(err.response?.data?.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo */}
          <div className="logo-section">
            <Link to="/" className="logo-link" onClick={closeMenus}>
              {settings?.platformName || 'DriveTunisia'}
            </Link>
            {user && (
              <div className="notification-bell-inline">
                <NotificationBell />
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            {/* Louer ma voiture - يظهر للمستخدم المسجل يذهب إلى add-car، للزائر يفتح نافذة التسجيل */}
            {user ? (
              <Link to="/add-car" className="rent-button">
                Louer ma voiture
              </Link>
            ) : (
              <button onClick={() => setShowRegisterModal(true)} className="rent-button">
                Louer ma voiture
              </button>
            )}
            
            {!user ? (
              <button onClick={() => setShowLoginModal(true)} className="login-link">
                Se connecter
              </button>
            ) : (
              <div className="user-menu-container">
                <button className="user-menu-button" onClick={toggleUserMenu}>
                  Mon compte ▼
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={closeMenus}>Mon profil</Link>
                    <Link to="/my-bookings" onClick={closeMenus}>Mes réservations</Link>
                    {/* ✅ إضافة Mes voitures للمؤجرين (owner) */}
                    {(user.role === 'owner') && (
                      <Link to="/owner-cars" onClick={closeMenus}>Mes voitures</Link>
                    )}
                    {(user.role === 'company') && (
                      <Link to="/owner-cars" onClick={closeMenus}>Mes voitures (Société)</Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={closeMenus}>Admin</Link>
                    )}
                    <button onClick={handleLogout} className="logout-btn">Se déconnecter</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            ☰
          </button>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <div className="mobile-menu-content">
                {/* Louer ma voiture - يظهر للمستخدم المسجل يذهب إلى add-car، للزائر يفتح نافذة التسجيل */}
                {user ? (
                  <Link 
                    to="/add-car" 
                    className="mobile-rent-button" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Louer ma voiture
                  </Link>
                ) : (
                  <button 
                    onClick={() => { setShowRegisterModal(true); setMobileMenuOpen(false); }}
                    className="mobile-rent-button"
                  >
                    Louer ma voiture
                  </button>
                )}
                
                {!user && (
                  <button 
                    onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                    className="mobile-link"
                  >
                    Se connecter
                  </button>
                )}
                
                {user && (
                  <>
                    <Link to="/profile" className="mobile-link" onClick={closeMenus}>
                      Mon profil
                    </Link>
                    <Link to="/my-bookings" className="mobile-link" onClick={closeMenus}>
                      Mes réservations
                    </Link>
                    {/* ✅ إضافة Mes voitures للمؤجرين (owner) */}
                    {(user.role === 'owner') && (
                      <Link to="/owner-cars" className="mobile-link" onClick={closeMenus}>
                        Mes voitures
                      </Link>
                    )}
                    {(user.role === 'company') && (
                      <Link to="/owner-cars" className="mobile-link" onClick={closeMenus}>
                        Mes voitures (Société)
                      </Link>
                    )}
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

      {/* Login Modal */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} title="Se connecter" size="small">
        <form onSubmit={handleLoginSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}
          
          <div className="modal-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              placeholder="exemple@email.com"
            />
          </div>
          
          <div className="modal-form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              placeholder="••••••"
            />
          </div>
          
          <button type="submit" disabled={loading} className="modal-submit">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          
          <div className="modal-footer-links">
            <button 
              type="button" 
              onClick={() => {
                setShowLoginModal(false);
                navigate('/forgot-password');
              }}
              className="modal-link"
            >
              Mot de passe oublié ?
            </button>
            <button 
              type="button" 
              onClick={() => {
                setShowLoginModal(false);
                setShowRegisterModal(true);
              }}
              className="modal-link"
            >
              Créer un compte
            </button>
          </div>
        </form>
      </Modal>

      {/* Register Modal - مع 3 خيارات */}
      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Créer un compte" size="medium">
        <form onSubmit={handleRegisterSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}
          
          <div className="modal-form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="name"
              value={registerData.name}
              onChange={handleRegisterChange}
              required
              placeholder="Votre nom"
            />
          </div>
          
          <div className="modal-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
              placeholder="exemple@email.com"
            />
          </div>
          
          <div className="modal-form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={registerData.phone}
              onChange={handleRegisterChange}
              required
              placeholder="+216 XX XXX XXX"
            />
          </div>
          
          <div className="modal-form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
              placeholder="•••••• (min. 6 caractères)"
            />
          </div>
          
          {/* ✅ 3 خيارات لحساب المستخدم */}
          <div className="modal-form-group">
            <label>Type de compte</label>
            <div className="modal-radio-group">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={registerData.role === 'user'}
                  onChange={handleRegisterChange}
                />
                Locataire
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={registerData.role === 'owner'}
                  onChange={handleRegisterChange}
                />
                Propriétaire
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="company"
                  checked={registerData.role === 'company'}
                  onChange={handleRegisterChange}
                />
                Société
              </label>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="modal-submit">
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
          
          <div className="modal-footer-links">
            <button 
              type="button" 
              onClick={() => {
                setShowRegisterModal(false);
                setShowLoginModal(true);
              }}
              className="modal-link"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Navbar;