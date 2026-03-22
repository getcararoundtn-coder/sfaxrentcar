import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';
import './OwnerCars.css';

const OwnerCars = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // تحديد التبويب النشط من الـ URL (messages, bookings, paiements, cars)
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'cars');

  // تحديث الـ URL عند تغيير التبويب
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ⚠️ مؤقتاً: تعطيل جلب المحادثات والمدفوعات حتى إنشاء الـ API
  const fetchMessages = useCallback(async () => {
    // مؤقتاً: استخدام بيانات تجريبية فارغة
    setMessages([]);
    // await API.get('/messages/owner'); // سيتم تفعيلها لاحقاً
  }, []);

  const fetchPayments = useCallback(async () => {
    // مؤقتاً: استخدام بيانات تجريبية فارغة
    setPayments([]);
    // await API.get('/payments/owner'); // سيتم تفعيلها لاحقاً
  }, []);

  // جلب جميع البيانات
  const fetchAllData = useCallback(async () => {
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
      
      // مؤقتاً: تعطيل جلب المحادثات والمدفوعات
      await Promise.all([
        fetchMessages(),
        fetchPayments()
      ]);
    } catch (err) {
      console.error('Error fetching owner data:', err);
      setError('حدث خطأ في جلب البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, [fetchMessages, fetchPayments]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
      case 'accepted': return { text: 'مقبول', color: '#28a745' };
      case 'approved': return { text: 'مؤكد', color: '#28a745' };
      case 'completed': return { text: 'مكتمل', color: '#17a2b8' };
      case 'refused': return { text: 'مرفوض', color: '#dc3545' };
      case 'cancelled': return { text: 'ملغي', color: '#dc3545' };
      default: return { text: status, color: '#6c757d' };
    }
  };

  // حساب الإيرادات بعد خصم العمولة (5%)
  const calculateNetRevenue = (total) => {
    const commission = (total * 5) / 100;
    return total - commission;
  };

  // تنسيق التاريخ
  const formatDate = (date) => {
    if (!date) return 'غير محدد';
    return new Date(date).toLocaleDateString('ar-TN');
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
            
            {/* بطاقات الإيرادات */}
            <div className="stat-card revenue">
              <span className="stat-value">{stats.revenue?.total || 0} د.ت</span>
              <span className="stat-label">الإيرادات الإجمالية</span>
              <small className="stat-note">قبل خصم العمولة</small>
            </div>
            <div className="stat-card net-revenue">
              <span className="stat-value">{calculateNetRevenue(stats.revenue?.total || 0)} د.ت</span>
              <span className="stat-label">صافي الإيرادات</span>
              <small className="stat-note">بعد خصم 5% عمولة</small>
            </div>
            <div className="stat-card monthly-revenue">
              <span className="stat-value">{stats.revenue?.monthly || 0} د.ت</span>
              <span className="stat-label">إيرادات هذا الشهر</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.averageRating || 0}/5</span>
              <span className="stat-label">متوسط التقييم</span>
            </div>
          </div>
        )}

        {/* Tabs - القائمة الجديدة */}
        <div className="tabs">
          <button
            onClick={() => handleTabChange('cars')}
            className={`tab ${activeTab === 'cars' ? 'active' : ''}`}
          >
            🚗 Voitures ({cars.length})
          </button>
          <button
            onClick={() => handleTabChange('bookings')}
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            📅 Locations ({bookings.length})
          </button>
          <button
            onClick={() => handleTabChange('messages')}
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          >
            💬 Messages ({messages.length})
          </button>
          <button
            onClick={() => handleTabChange('paiements')}
            className={`tab ${activeTab === 'paiements' ? 'active' : ''}`}
          >
            💰 Paiements ({payments.length})
          </button>
        </div>

        {/* Voitures Tab */}
        {activeTab === 'cars' && (
          <div>
            {cars.length === 0 ? (
              <div className="no-data">
                <p>لا توجد سيارات مضافة.</p>
                <Link to="/rent-your-car" className="add-link">➕ إضافة سيارة جديدة</Link>
              </div>
            ) : (
              <div className="cars-grid">
                {cars.map(car => (
                  <div key={car._id} className="car-card">
                    <div className="car-header">
                      <h3>{car.brand} {car.model} ({car.year})</h3>
                      <span className={`status-badge ${car.status}`}>
                        {car.status === 'approved' ? 'موافق عليها' : 
                         car.status === 'pending' ? 'في انتظار الموافقة' : 
                         car.status === 'draft' ? 'مسودة' : 'مرفوضة'}
                      </span>
                    </div>

                    {car.images && car.images.length > 0 && (
                      <img src={car.images[0]} alt={car.brand} className="car-image" />
                    )}

                    <div className="car-details">
                      <p><strong>السعر:</strong> {car.pricePerDay || 'غير محدد'} دينار/يوم</p>
                      <p><strong>الموقع:</strong> {car.location || car.city || 'غير محدد'}</p>
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

        {/* Locations Tab (Bookings) */}
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
                  const netRevenue = calculateNetRevenue(booking.totalPrice || 0);
                  const commission = (booking.totalPrice || 0) * 0.05;
                  
                  return (
                    <div key={booking._id} className="booking-card">
                      <div className="booking-header">
                        <h3>{booking.carId?.brand} {booking.carId?.model}</h3>
                        <span className="status-badge" style={{ backgroundColor: status.color + '20', color: status.color }}>
                          {status.text}
                        </span>
                      </div>

                      <div className="booking-details">
                        <p><strong>المستأجر:</strong> {booking.renterId?.name || 'غير معروف'}</p>
                        <p><strong>البريد:</strong> {booking.renterId?.email || 'غير معروف'}</p>
                        <p><strong>الهاتف:</strong> {booking.renterId?.phone || 'غير معروف'}</p>
                        <p><strong>من:</strong> {formatDate(booking.startDate)}</p>
                        <p><strong>إلى:</strong> {formatDate(booking.endDate)}</p>
                        <p><strong>الإجمالي:</strong> {booking.totalPrice} دينار</p>
                        {booking.status === 'completed' && (
                          <>
                            <p className="commission-info">
                              <strong>عمولة المنصة (5%):</strong> {commission.toFixed(2)} دينار
                            </p>
                            <p className="net-revenue-info">
                              <strong>صافي أرباحك:</strong> {netRevenue.toFixed(2)} دينار
                            </p>
                          </>
                        )}
                      </div>

                      {(booking.status === 'accepted' || booking.status === 'approved') && (
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

        {/* Messages Tab - مؤقتاً */}
        {activeTab === 'messages' && (
          <div>
            <div className="no-data">
              <p>💬 قريباً: نظام المحادثات</p>
              <p className="info-text">سيتم إضافة نظام المحادثات قريباً للتواصل مع المستأجرين</p>
            </div>
          </div>
        )}

        {/* Paiements Tab - مؤقتاً */}
        {activeTab === 'paiements' && (
          <div>
            <div className="no-data">
              <p>💰 قريباً: نظام المدفوعات</p>
              <p className="info-text">سيتم عرض تفاصيل المدفوعات هنا عند اكتمال الحجوزات</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OwnerCars;