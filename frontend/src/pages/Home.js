import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import API from '../services/api';
import LazyLoad from 'react-lazyload';
import { showError } from '../utils/ToastConfig';
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('خطأ في قراءة المستخدم:', e);
        localStorage.removeItem('user');
      }
    }

    const fetchCars = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/cars');
        console.log('Cars fetched:', data);
        setCars(data.data || []);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('حدث خطأ في تحميل السيارات');
        showError('❌ فشل تحميل السيارات');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <>
      <Navbar />
      <div 
        className="hero" 
        style={{ 
          backgroundImage: `url('/images/hero_bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="hero-overlay">
          <h1 className="hero-title">استأجر سيارتك المفضلة بسهولة وسرعة</h1>
          <p className="hero-subtitle">منصة تونسية لكراء السيارات بين الأفراد والشركات</p>
          
          {!user && (
            <Link to="/register" className="hero-button">
              ابدأ الآن
            </Link>
          )}
          
          {user && (
            <p className="welcome-message">مرحباً بعودتك، {user.name}</p>
          )}
        </div>
      </div>

      <div className="cars-section">
        <h2 className="section-title">السيارات المتاحة</h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>جاري تحميل السيارات...</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : cars.length === 0 ? (
          <p className="no-cars">لا توجد سيارات متاحة حالياً</p>
        ) : (
          <div className="cars-grid">
            {cars.map(car => (
              <div key={car._id} className="car-card">
                <LazyLoad height={150} offset={100} once>
                  <img 
                    src={car.images?.[0] || '/default-car.jpg'} 
                    alt={car.brand} 
                    className="car-image" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-car.jpg';
                    }}
                  />
                </LazyLoad>
                <h3 className="car-title">{car.brand} {car.model} ({car.year})</h3>
                <p className="car-price"><strong>{car.pricePerDay} دينار/يوم</strong></p>
                <p className="car-location">{car.location}</p>
                <Link to={`/car/${car._id}`} className="car-details-button">
                  عرض التفاصيل
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Home;