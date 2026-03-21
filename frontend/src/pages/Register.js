import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

    // التحقق من الموافقة على الشروط
    if (!agreedToTerms) {
      setError('❌ يجب الموافقة على الشروط والأحكام');
      showError('يجب الموافقة على الشروط والأحكام');
      setLoading(false);
      return;
    }

    try {
      const response = await API.post('/auth/register', formData);
      
      if (response.data.success) {
        showSuccess('✅ تم إنشاء الحساب بنجاح');
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'فشل إنشاء الحساب';
      setError('❌ ' + errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-container">
        <div className="register-card">
          <h1 className="register-title">إنشاء حساب جديد</h1>
          
          {error && (
            <div className="error-message-box">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group">
              <label className="input-label">الاسم الكامل</label>
              <input
                type="text"
                name="name"
                placeholder="أدخل اسمك الكامل"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

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
              <label className="input-label">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                placeholder="أدخل رقم هاتفك"
                value={formData.phone}
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
                placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="input-field"
              />
              <small style={{ color: '#666', marginTop: '5px' }}>
                يجب أن تكون كلمة المرور 6 أحرف على الأقل
              </small>
            </div>

            {/* ✅ إضافة شروط الاستخدام */}
            <div className="terms-group">
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                />
                <span>
                  أوافق على{' '}
                  <Link to="/terms" target="_blank">الشروط والأحكام</Link>{' '}
                  و{' '}
                  <Link to="/privacy" target="_blank">سياسة الخصوصية</Link>
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`register-button ${loading ? 'loading' : ''}`}
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </button>
          </form>

          <p className="login-link">
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;