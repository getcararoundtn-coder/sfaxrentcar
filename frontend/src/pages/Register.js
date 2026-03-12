import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import API from '../services/api';
import { showSuccess, showError, showInfo } from '../utils/ToastConfig';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم الكامل مطلوب';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError('❌ يرجى تصحيح الأخطاء في النموذج');
      return;
    }
    
    if (!agreeTerms || !agreePrivacy) {
      showError('❌ يجب الموافقة على الشروط والأحكام وسياسة الخصوصية');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Attempting registration with:', formData);
      const response = await API.post('/auth/register', formData);
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        showSuccess('✅ ' + response.data.message);
        showInfo('📧 تم إنشاء حسابك بنجاح، يمكنك الآن تسجيل الدخول');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'فشل إنشاء الحساب';
      
      if (errorMessage.includes('مستخدم بالفعل')) {
        setErrors({ ...errors, email: 'هذا البريد الإلكتروني مستخدم بالفعل' });
        showError('❌ هذا البريد الإلكتروني مستخدم بالفعل');
      } else if (errorMessage.includes('كلمة المرور')) {
        setErrors({ ...errors, password: errorMessage });
        showError('❌ ' + errorMessage);
      } else {
        showError('❌ ' + errorMessage);
      }
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
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group">
              <label className="input-label">الاسم الكامل</label>
              <input
                type="text"
                name="name"
                placeholder="أدخل اسمك الكامل"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="input-group">
              <label className="input-label">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                placeholder="أدخل بريدك الإ elektronي"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            
            <div className="input-group">
              <label className="input-label">كلمة المرور</label>
              <input
                type="password"
                name="password"
                placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${errors.password ? 'error' : ''}`}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
              <small className="input-hint">يجب أن تكون كلمة المرور 6 أحرف على الأقل</small>
            </div>
            
            <div className="input-group">
              <label className="input-label">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                placeholder="أدخل رقم هاتفك"
                value={formData.phone}
                onChange={handleChange}
                className={`input-field ${errors.phone ? 'error' : ''}`}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            {/* قسم الموافقة على الشروط */}
            <div className="terms-section">
              <h3 className="terms-title">الموافقة على الشروط</h3>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="checkbox-input"
                />
                <label htmlFor="agreeTerms" className="checkbox-label">
                  أوافق على <Link to="/terms" target="_blank" className="terms-link">الشروط والأحكام</Link>
                </label>
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="agreePrivacy"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="checkbox-input"
                />
                <label htmlFor="agreePrivacy" className="checkbox-label">
                  أوافق على <Link to="/privacy" target="_blank" className="terms-link">سياسة الخصوصية</Link>
                </label>
              </div>

              <p className="terms-note">
                بالضغط على "تسجيل"، فإنك تقر بأنك قد قرأت وفهمت ووافقت على 
                الشروط والأحكام وسياسة الخصوصية.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`register-button ${loading ? 'loading' : ''}`}
            >
              {loading ? 'جاري إنشاء الحساب...' : 'تسجيل'}
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