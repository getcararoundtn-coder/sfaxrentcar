import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { AuthContext } from '../context/AuthContext';
import CarWizard from '../components/CarWizard';
import API from '../services/api';
import './RentYourCar.css';

const RentYourCar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [initialData, setInitialData] = useState({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    location: '',
    deliveryMethod: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ حفظ المسودة الأولية - إزالة المتغير غير المستخدم
      await API.post('/cars/wizard/save', {
        step: 1,
        data: initialData
      });
      setShowWizard(true);
    } catch (err) {
      console.error('Error saving initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setInitialData({ ...initialData, [e.target.name]: e.target.value });
  };

  // إذا كان المستخدم غير مسجل، نعرض رسالة أو نعيد التوجيه
  if (!user) {
    return null; // أو يمكن عرض loading
  }

  if (showWizard) {
    return <CarWizard initialData={initialData} />;
  }

  return (
    <>
      <Navbar />
      <div className="rent-car-page">
        <div className="rent-car-left">
          <h1 className="rent-car-title">اربح المال عند كراء سيارتك</h1>
          <p className="rent-car-subtitle">inscription votre voiture</p>

          <form onSubmit={handleInitialSubmit} className="rent-car-form">
            <div className="form-group">
              <label>Brand de voiture *</label>
              <input
                type="text"
                name="brand"
                value={initialData.brand}
                onChange={handleChange}
                required
                placeholder="Ex: Renault, Peugeot, Toyota..."
              />
            </div>

            <div className="form-group">
              <label>Modèle *</label>
              <input
                type="text"
                name="model"
                value={initialData.model}
                onChange={handleChange}
                required
                placeholder="Ex: Clio, 208, Corolla..."
              />
            </div>

            <div className="form-group">
              <label>Année de fabrication *</label>
              <input
                type="number"
                name="year"
                value={initialData.year}
                onChange={handleChange}
                required
                min="1990"
                max="2030"
              />
            </div>

            <div className="form-group">
              <label>Kilométrage *</label>
              <select name="mileage" value={initialData.mileage} onChange={handleChange} required>
                <option value="">Sélectionner</option>
                <option value="0-15000">0-15000 km</option>
                <option value="15000-50000">15000-50000 km</option>
                <option value="50000-100000">50000-100000 km</option>
                <option value="100000-150000">100000-150000 km</option>
                <option value="150000-200000">150000-200000 km</option>
                <option value="200000+">200000+ km</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={initialData.location}
                onChange={handleChange}
                required
                placeholder="Sfax, Tunis, Sousse..."
              />
            </div>

            <button type="submit" disabled={loading} className="start-button">
              {loading ? 'Chargement...' : 'ابدأ الآن'}
            </button>
          </form>

          <div className="delivery-options">
            <h3>طرق الكراء</h3>
            <div className="delivery-option">
              <span className="delivery-icon">🚚</span>
              <div>
                <strong>توصيل السيارة للمستأجر</strong>
                <p>نقوم بتوصيل السيارة إلى عنوان المستأجر</p>
              </div>
            </div>
            <div className="delivery-option">
              <span className="delivery-icon">🏠</span>
              <div>
                <strong>المستأجر يأتي لاستلام السيارة</strong>
                <p>يتم الاستلام في المكان المتفق عليه</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>كيف تعمل المنصة؟</h3>
            <ul>
              <li>📝 أضف سيارتك في بضع خطوات</li>
              <li>✅ تأكيد الحجز من قبل المستأجر</li>
              <li>💰 استلم المال مباشرة بعد الحجز</li>
              <li>💸 دفع عمولة 5% فقط عند نجاح الحجز</li>
            </ul>
          </div>

          <div className="about-section">
            <a href="/about">à propos</a>
          </div>
        </div>

        <div className="rent-car-right">
          <img 
            src={`${process.env.PUBLIC_URL}/images/car-rental.jpg`} 
            alt="Rent your car"
            className="rent-car-image"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RentYourCar;