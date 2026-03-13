import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', formData.email);
      const response = await API.post('/auth/login', formData);
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        // تخزين بيانات المستخدم فقط
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        // لا حاجة لتخزين التوكن - Backend يستخدم httpOnly cookies
        console.log('✅ Login successful, using httpOnly cookies');
        
        showSuccess('تم تسجيل الدخول بنجاح');
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'فشل تسجيل الدخول';
      
      if (errorMessage.includes('البريد الإلكتروني أو كلمة المرور')) {
        setError('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة');
        showError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (errorMessage.includes('مطلوبان')) {
        setError('❌ يرجى إدخال البريد الإلكتروني وكلمة المرور');
        showError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      } else {
        setError('❌ ' + errorMessage);
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">تسجيل الدخول</h1>
          
          {error && (
            <div className="error-message-box">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">كلمة المرور</label>
              <input
                type="password"
                name="password"
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className={`login-button ${loading ? 'loading' : ''}`}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
          
          <p className="forgot-password">
            <Link to="/forgot-password">نسيت كلمة المرور؟</Link>
          </p>
          
          <p className="register-link">
            ليس لديك حساب؟ <Link to="/register">إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;