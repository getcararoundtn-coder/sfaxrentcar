import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCars: 0,
    happyCustomers: 0,
    cities: 0
  });

  useEffect(() => {
    fetchFeaturedCars();
    fetchStats();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      const { data } = await API.get('/cars/featured');
      setFeaturedCars(data.data || []);
    } catch (err) {
      console.error('Error fetching featured cars:', err);
      // بيانات تجريبية في حالة فشل الاتصال
      setFeaturedCars([
        { _id: 1, brand: 'تويوتا', model: 'كورولا', pricePerDay: 120, images: ['/default-car.jpg'] },
        { _id: 2, brand: 'هيونداي', model: 'إلنترا', pricePerDay: 100, images: ['/default-car.jpg'] },
        { _id: 3, brand: 'مرسيدس', model: 'C200', pricePerDay: 250, images: ['/default-car.jpg'] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/cars/stats');
      setStats(data.data || { totalCars: 150, happyCustomers: 1200, cities: 25 });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats({ totalCars: 150, happyCustomers: 1200, cities: 25 });
    }
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">استأجر سيارتك المفضلة بسهولة وسرعة</h1>
            <p className="hero-subtitle">
              منصة تونسية لكراء السيارات بين الأفراد والشركات
            </p>
            <Link to="/cars" className="hero-button">
              ابدأ الآن
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalCars}+</div>
              <div className="stat-label">سيارة متاحة</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.happyCustomers}+</div>
              <div className="stat-label">مستأجر سعيد</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.cities}</div>
              <div className="stat-label">مدينة في تونس</div>
            </div>
          </div>
        </section>

        {/* Featured Cars */}
        <section className="featured-section">
          <h2 className="section-title">سيارات مميزة</h2>
          {loading ? (
            <div className="loading">جاري التحميل...</div>
          ) : (
            <div className="cars-grid">
              {featuredCars.map((car) => (
                <div key={car._id} className="car-card">
                  <img 
                    src={car.images?.[0] || '/default-car.jpg'} 
                    alt={`${car.brand} ${car.model}`}
                    className="car-image"
                  />
                  <div className="car-info">
                    <h3 className="car-title">{car.brand} {car.model}</h3>
                    <p className="car-price">{car.pricePerDay} دينار/يوم</p>
                    <Link to={`/car/${car._id}`} className="car-button">
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <h2 className="section-title">كيف تعمل المنصة؟</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">1️⃣</div>
              <h3 className="step-title">ابحث عن سيارة</h3>
              <p className="step-description">اختر السيارة التي تناسب احتياجاتك من بين مئات السيارات المتاحة</p>
            </div>
            <div className="step-card">
              <div className="step-icon">2️⃣</div>
              <h3 className="step-title">احجز بسهولة</h3>
              <p className="step-description">اختر تواريخ الحجز وأكمل العملية بضغطة زر</p>
            </div>
            <div className="step-card">
              <div className="step-icon">3️⃣</div>
              <h3 className="step-title">استلم السيارة</h3>
              <p className="step-description">التقي بالمالك في المكان المتفق عليه واستلم سيارتك</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="cta-section">
            <div className="cta-content">
              <h2 className="cta-title">هل لديك سيارة وتريد تأجيرها؟</h2>
              <p className="cta-text">
                انضم إلى منصتنا الآن وابدأ في تحقيق دخل إضافي من سيارتك
              </p>
              <Link to="/register" className="cta-button">
                إنشاء حساب جديد
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default Home;