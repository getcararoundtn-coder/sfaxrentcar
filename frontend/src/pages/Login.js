import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

// مؤقتاً نستخدم alert بدلاً من toast حتى نتأكد من المشكلة
const showSuccess = (msg) => alert('✅ ' + msg);
const showError = (msg) => alert('❌ ' + msg);

// علق استيراد CSS مؤقتاً حتى نتأكد من وجود الملف
// import './Login.css';

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
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('✅ Token stored successfully');
        }
        
        showSuccess('تم تسجيل الدخول بنجاح');
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'فشل تسجيل الدخول';
      setError('❌ ' + errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>تسجيل الدخول</h1>
          
          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>كلمة المرور</label>
              <input
                type="password"
                name="password"
                placeholder="أدخل كلمة المرور"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
          
          <p style={styles.forgotPassword}>
            <Link to="/forgot-password" style={styles.link}>نسيت كلمة المرور؟</Link>
          </p>
          
          <p style={styles.registerLink}>
            ليس لديك حساب؟ <Link to="/register" style={styles.link}>إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 60px)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
    fontSize: '32px',
    fontWeight: '600'
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    padding: '12px 15px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#721c24'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '14px',
    color: '#555',
    fontWeight: '500'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none'
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(135deg, #007bff, #0056b3)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  buttonDisabled: {
    background: '#6c757d',
    cursor: 'not-allowed'
  },
  forgotPassword: {
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '14px'
  },
  registerLink: {
    textAlign: 'center',
    marginTop: '10px',
    color: '#666',
    fontSize: '14px'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none'
  }
};

export default Login;