import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';
import './AddCar.css';

const AddCar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // ✅ إعادة توجيه تلقائية إلى صفحة الويزارد الجديدة بعد 5 ثواني
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/rent-your-car');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, navigate]);

  const handleGoToWizard = () => {
    navigate('/rent-your-car');
  };

  return (
    <>
      <Navbar />
      <div className="add-car-redirect">
        <div className="redirect-card">
          <div className="redirect-icon">🚗</div>
          <h1 className="redirect-title">تم تحديث النظام!</h1>
          <p className="redirect-message">
            تم استبدال صفحة إضافة السيارة القديمة بنظام جديد أكثر سهولة.
          </p>
          <p className="redirect-message">
            سيتم توجيهك تلقائياً إلى الصفحة الجديدة خلال <strong>{countdown}</strong> ثواني.
          </p>
          
          <button onClick={handleGoToWizard} className="redirect-button">
            ➕ إضافة سيارة الآن (الطريقة الجديدة)
          </button>
          
          <Link to="/owner-cars" className="redirect-link">
            ← العودة إلى سياراتي
          </Link>
          
          <div className="redirect-info">
            <h4>📋 ما الجديد في النظام الجديد؟</h4>
            <ul>
              <li>✨ عملية إضافة سيارة خطوة بخطوة (14 خطوة)</li>
              <li>📸 إدخال جميع معلومات السيارة بالتفصيل</li>
              <li>📍 تحديد الموقع بدقة (ولاية + معتمدية + عنوان)</li>
              <li>🔧 إضافة المعدات (GPS, Bluetooth, Climatisation...)</li>
              <li>💰 حساب العمولة والمدفوعات بشكل أوضح</li>
              <li>📱 تصميم متجاوب وسهل الاستخدام</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddCar;