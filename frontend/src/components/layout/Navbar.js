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
  const { user, logout, setUser, loginWithFirebaseGoogle } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [popupMenuOpen, setPopupMenuOpen] = useState(false);
  
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
    role: 'user',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
    setPopupMenuOpen(false);
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const togglePopupMenu = () => {
    setPopupMenuOpen(!popupMenuOpen);
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setPopupMenuOpen(false);
  };

  // الحصول على أول حرف من الاسم للصورة
  const getInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // ✅ Google Login Handler - مع تمرير الدور من التسجيل
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // ✅ الحصول على الدور المختار من نموذج التسجيل (إذا كان مفتوحاً)
      // أو استخدام الدور الافتراضي 'user'
      const selectedRole = registerData.role || 'user';
      console.log('🔵 Google login with role:', selectedRole);
      
      const result = await loginWithFirebaseGoogle(selectedRole); // ✅ تمرير الدور
      if (result.success) {
        showSuccess('✅ تم تسجيل الدخول بنجاح');
        setShowLoginModal(false);
        setShowRegisterModal(false);
        navigate('/');
      } else {
        setError(result.error || 'فشل تسجيل الدخول');
        showError(result.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('حدث خطأ في تسجيل الدخول');
      showError('حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
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

    if (!registerData.agreeToTerms) {
      setError('يرجى الموافقة على الشروط والأحكام');
      showError('يرجى الموافقة على الشروط والأحكام');
      setLoading(false);
      return;
    }

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
        // ✅ بعد التسجيل، نفتح نافذة تسجيل الدخول مع حفظ الدور
        setRegisterData({ name: '', email: '', password: '', phone: '', role: 'user', agreeToTerms: false });
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
            {/* زر Louer ma voiture */}
            {user ? (
              <Link to="/rent-your-car" className="rent-button">
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
                {/* Popup Menu Trigger */}
                <button className="user-menu-trigger" onClick={togglePopupMenu}>
                  <div className="user-avatar">
                    {getInitial()}
                  </div>
                  <span className="user-name">{user.name?.split(' ')[0] || user.name || 'Compte'}</span>
                  <span className={`user-chevron ${popupMenuOpen ? 'open' : ''}`}>▼</span>
                </button>
                
                {/* Popup Menu مع Profile */}
                {popupMenuOpen && (
                  <div className="user-popup-menu">
                    <div className="popup-user-info">
                      <div className="popup-user-name">{user.name || 'Utilisateur'}</div>
                      <div className="popup-user-email">{user.email}</div>
                    </div>
                    
                    <div className="popup-menu-title">Menu propriétaire</div>
                    
                    <Link to="/profile" className="popup-menu-item" onClick={closeMenus}>
                      <span className="popup-menu-icon">👤</span>
                      <span>Mon profil</span>
                    </Link>
                    
                    <Link to="/owner-cars?tab=messages" className="popup-menu-item" onClick={closeMenus}>
                      <span className="popup-menu-icon">💬</span>
                      <span>Messages</span>
                    </Link>
                    
                    <Link to="/owner-cars?tab=bookings" className="popup-menu-item" onClick={closeMenus}>
                      <span className="popup-menu-icon">📅</span>
                      <span>Locations</span>
                    </Link>
                    
                    <Link to="/owner-cars?tab=paiements" className="popup-menu-item" onClick={closeMenus}>
                      <span className="popup-menu-icon">💰</span>
                      <span>Paiements</span>
                    </Link>
                    
                    <Link to="/owner-cars?tab=cars" className="popup-menu-item" onClick={closeMenus}>
                      <span className="popup-menu-icon">🚗</span>
                      <span>Voitures</span>
                    </Link>
                    
                    {/* إضافة قسم Admin للمشرفين */}
                    {user.role === 'admin' && (
                      <>
                        <div className="popup-menu-divider"></div>
                        <div className="popup-menu-title">Administration</div>
                        <Link to="/admin" className="popup-menu-item" onClick={closeMenus}>
                          <span className="popup-menu-icon">⚙️</span>
                          <span>Admin Dashboard</span>
                        </Link>
                      </>
                    )}
                    
                    <button onClick={handleLogout} className="popup-menu-item logout">
                      <span className="popup-menu-icon">🚪</span>
                      <span>Se déconnecter</span>
                    </button>
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
                {user ? (
                  <Link 
                    to="/rent-your-car" 
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
                      👤 Mon profil
                    </Link>
                    <Link to="/my-bookings" className="mobile-link" onClick={closeMenus}>
                      Mes réservations
                    </Link>
                    {(user.role === 'owner' || user.role === 'company') && (
                      <>
                        <Link to="/owner-cars?tab=messages" className="mobile-link" onClick={closeMenus}>
                          💬 Messages
                        </Link>
                        <Link to="/owner-cars?tab=bookings" className="mobile-link" onClick={closeMenus}>
                          📅 Locations
                        </Link>
                        <Link to="/owner-cars?tab=paiements" className="mobile-link" onClick={closeMenus}>
                          💰 Paiements
                        </Link>
                        <Link to="/owner-cars?tab=cars" className="mobile-link" onClick={closeMenus}>
                          🚗 Voitures
                        </Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <div className="mobile-divider"></div>
                        <Link to="/admin" className="mobile-link" onClick={closeMenus}>
                          ⚙️ Admin Dashboard
                        </Link>
                      </>
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

      {/* Login Modal مع زر Google */}
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

          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="google-login-button"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              style={{ width: '20px', marginRight: '8px' }}
            />
            Continuer avec Google
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

      {/* Register Modal */}
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
          
          <div className="modal-form-group terms-group">
            <label className="terms-label">
              <input
                type="checkbox"
                checked={registerData.agreeToTerms}
                onChange={(e) => setRegisterData({ ...registerData, agreeToTerms: e.target.checked })}
                required
              />
              <span>
                J'accepte les{' '}
                <Link to="/terms" target="_blank" style={{ color: '#6b46c0', textDecoration: 'underline' }}>
                  conditions d'utilisation
                </Link>
                {' '}et la{' '}
                <Link to="/privacy" target="_blank" style={{ color: '#6b46c0', textDecoration: 'underline' }}>
                  politique de confidentialité
                </Link>
              </span>
            </label>
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