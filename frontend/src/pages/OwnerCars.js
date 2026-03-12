import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';
import './OwnerCars.css';

const OwnerCars = () => {
  const { user } = useContext(AuthContext);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('cars');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [carsRes, bookingsRes, statsRes] = await Promise.all([
        API.get('/cars/my-cars'),
        API.get('/cars/my-bookings'),
        API.get('/cars/owner-stats')
      ]);
      
      setCars(carsRes.data.data || []);
      setBookings(bookingsRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err) {
      console.error('Error fetching owner data:', err);
      setError('حدث خطأ في جلب البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (carId, currentStatus) => {
    try {
      const res = await API.patch(`/cars/${carId}/toggle-availability`);
      showSuccess(res.data.message);
      fetchAllData();
    } catch (err) {
      showError('فشل تحديث حالة السيارة');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;
    try {
      await API.patch(`/cars/cancel-booking/${bookingId}`);
      showSuccess('تم إلغاء الحجز بنجاح');
      fetchAllData();
    } catch (err) {
      showError('فشل إلغاء الحجز');
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return { text: 'في انتظار الموافقة', color: '#ffc107' };
      case 'approved': return { text: 'مؤكد', color: '#28a745' };
      case 'completed': return { text: 'مكتمل', color: '#17a2b8' };
      case 'cancelled': return { text: 'ملغي', color: '#dc3545' };
      default: return { text: status, color: '#6c757d' };
    }
  };

  if (loading) return <><Navbar /><div className="loading">جاري التحميل...</div></>;

  return (
    <>
      <Navbar />
      <div className="owner-container">
        <h1 className="owner-title">لوحة تحكم المؤجر</h1>
        <p className="owner-welcome">مرحباً {user?.name}</p>

        {error && <div className="error-message">{error}</div>}

        {/* بطاقات الإحصائيات */}
        {stats && (
  <div className="stats-cards">
    {/* ... البطاقات الموجودة ... */}
    
    {/* بطاقات الإيرادات مفصلة */}
    <div className="stat-card revenue">
      <span className="stat-value">{stats.revenue?.total || 0} د.ت</span>
      <span className="stat-label">إيرادات مكتملة</span>
      <small className="stat-note">من حجوزات مكتملة</small>
    </div>
    
    <div className="stat-card pending-revenue">
      <span className="stat-value">{stats.revenue?.pending || 0} د.ت</span>
      <span className="stat-label">إيرادات معلقة</span>
      <small className="stat-note">حجوزات مؤكدة لم تكتمل بعد</small>
    </div>
    
    <div className="stat-card monthly-revenue">
      <span className="stat-value">{stats.revenue?.monthly || 0} د.ت</span>
      <span className="stat-label">إيرادات هذا الشهر</span>
    </div>
  </div>
)}
        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <span className="stat-value">{stats.cars?.total || 0}</span>
              <span className="stat-label">إجمالي السيارات</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.cars?.available || 0}</span>
              <span className="stat-label">سيارات متاحة</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.cars?.pending || 0}</span>
              <span className="stat-label">في انتظار الموافقة</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.bookings?.total || 0}</span>
              <span className="stat-label">إجمالي الحجوزات</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.bookings?.completed || 0}</span>
              <span className="stat-label">حجوزات مكتملة</span>
            </div>
            <div className="stat-card revenue">
              <span className="stat-value">{stats.revenue?.total || 0} د.ت</span>
              <span className="stat-label">إجمالي الإيرادات</span>
            </div>
            <div className="stat-card revenue">
              <span className="stat-value">{stats.revenue?.monthly || 0} د.ت</span>
              <span className="stat-label">إيرادات هذا الشهر</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.averageRating || 0}</span>
              <span className="stat-label">متوسط التقييم</span>
            </div>
          </div>
        )}

        <div className="tabs">
          <button
            onClick={() => setActiveTab('cars')}
            className={`tab ${activeTab === 'cars' ? 'active' : ''}`}
          >
            🚗 سياراتي ({cars.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            📅 حجوزات سياراتي ({bookings.length})
          </button>
        </div>

        {activeTab === 'cars' && (
          <div>
            {cars.length === 0 ? (
              <div className="no-data">
                <p>لا توجد سيارات مضافة.</p>
                <Link to="/add-car" className="add-link">➕ إضافة سيارة جديدة</Link>
              </div>
            ) : (
              <div className="cars-grid">
                {cars.map(car => (
                  <div key={car._id} className="car-card">
                    <div className="car-header">
                      <h3>{car.brand} {car.model} ({car.year})</h3>
                      <span className={`status-badge ${car.status}`}>
                        {car.status === 'approved' ? 'موافق عليها' : 
                         car.status === 'pending' ? 'في انتظار الموافقة' : 'مرفوضة'}
                      </span>
                    </div>

                    {car.images && car.images.length > 0 && (
                      <img src={car.images[0]} alt={car.brand} className="car-image" />
                    )}

                    <div className="car-details">
                      <p><strong>السعر:</strong> {car.pricePerDay} دينار/يوم</p>
                      <p><strong>الموقع:</strong> {car.location}</p>
                      <p><strong>الحالة:</strong> 
                        <span className={`availability ${car.isAvailable ? 'available' : 'unavailable'}`}>
                          {car.isAvailable ? '✅ متاحة' : '❌ غير متاحة'}
                        </span>
                      </p>
                    </div>

                    <div className="car-actions">
                      <button
                        onClick={() => handleToggleAvailability(car._id, car.isAvailable)}
                        className={`toggle-button ${car.isAvailable ? 'unavailable' : 'available'}`}
                      >
                        {car.isAvailable ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <Link to={`/car/${car._id}`} className="view-button">عرض التفاصيل</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            {bookings.length === 0 ? (
              <div className="no-data">
                <p>لا توجد حجوزات على سياراتك</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => {
                  const status = getStatusText(booking.status);
                  return (
                    <div key={booking._id} className="booking-card">
                      <div className="booking-header">
                        <h3>{booking.carId?.brand} {booking.carId?.model}</h3>
                        <span className="status-badge" style={{ backgroundColor: status.color + '20', color: status.color }}>
                          {status.text}
                        </span>
                      </div>

                      <div className="booking-details">
                        <p><strong>المستأجر:</strong> {booking.renterId?.name}</p>
                        <p><strong>البريد:</strong> {booking.renterId?.email}</p>
                        <p><strong>الهاتف:</strong> {booking.renterId?.phone}</p>
                        <p><strong>من:</strong> {new Date(booking.startDate).toLocaleDateString('ar-TN')}</p>
                        <p><strong>إلى:</strong> {new Date(booking.endDate).toLocaleDateString('ar-TN')}</p>
                        <p><strong>الإجمالي:</strong> {booking.totalPrice} دينار</p>
                      </div>

                      {booking.status === 'approved' && (
                        <div className="booking-actions">
                          <Link to={`/messages/${booking._id}`} className="message-button">
                            💬 المحادثة
                          </Link>
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="cancel-button"
                          >
                            إلغاء الحجز
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default OwnerCars;