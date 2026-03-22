import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { showSuccess, showError, showWarning } from '../utils/ToastConfig';
import ModalUpload from '../components/ModalUpload';
import './Booking.css';

const Booking = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (!user) {
      showError('الرجاء تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    const fetchCar = async () => {
      try {
        console.log('🔍 Fetching car details for:', carId);
        const { data } = await API.get(`/cars/${carId}`);
        setCar(data.data);
        console.log('✅ Car details loaded:', data.data);
      } catch (err) {
        console.error('❌ Error fetching car:', err);
        showError('فشل تحميل بيانات السيارة');
        navigate('/cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId, user, navigate]);

  // حساب السعر عند تغيير التواريخ
  useEffect(() => {
    if (startDate && endDate && car) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (days > 0) {
        const pricePerDay = car.pricePerDay;
        const subtotal = pricePerDay * days;
        const commission = subtotal * 0.1; // 10% commission
        setTotalPrice(subtotal + commission);
      } else {
        setTotalPrice(0);
      }
    }
  }, [startDate, endDate, car]);

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // ✅ التحقق من توثيق المستخدم
    if (user?.verificationStatus !== 'approved') {
      showWarning('يجب توثيق حسابك أولاً (رفع رخصة القيادة)');
      setShowUploadModal(true);
      return;
    }

    if (!startDate || !endDate) {
      showError('يرجى اختيار تاريخ البداية والنهاية');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      showError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }

    console.log('📝 Submitting booking...');
    setBookingLoading(true);
    setBookingError('');

    try {
      const response = await API.post('/bookings', {
        carId,
        startDate,
        endDate,
        totalPrice
      });

      console.log('✅ Booking response:', response.data);

      if (response.data.success) {
        setBookingSuccess(true);
        showSuccess('✅ تم إنشاء الحجز بنجاح');
        
        setTimeout(() => {
          navigate('/my-bookings');
        }, 4000);
      }
    } catch (err) {
      console.error('❌ Booking error:', err);
      const errorMessage = err.response?.data?.message || 'حدث خطأ في الحجز';
      setBookingError(errorMessage);
      
      if (errorMessage.includes('محجوزة')) {
        showError('❌ هذه السيارة محجوزة في الفترة المحددة');
      } else {
        showError(errorMessage);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      </>
    );
  }

  if (!car) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <p>السيارة غير موجودة</p>
          <button onClick={() => navigate('/cars')}>العودة للسيارات</button>
        </div>
      </>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Navbar />
      <div className="booking-page">
        <div className="booking-container">
          <h1 className="booking-title">تأكيد الحجز</h1>
          
          <div className="booking-content">
            {bookingSuccess ? (
              // رسالة نجاح الحجز
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h2>تم إنشاء الحجز بنجاح!</h2>
                <div className="pending-message">
                  <span className="pending-icon">⏳</span>
                  <p>حجزك قيد المراجعة من قبل الإدارة</p>
                  <p className="pending-sub">سيتم إشعارك عند الموافقة على الحجز</p>
                </div>
                <div className="booking-info">
                  <h3>تفاصيل الحجز:</h3>
                  <div className="info-row">
                    <span className="info-label">السيارة:</span>
                    <span className="info-value">{car.brand} {car.model}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">من:</span>
                    <span className="info-value">{new Date(startDate).toLocaleDateString('ar-TN')}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">إلى:</span>
                    <span className="info-value">{new Date(endDate).toLocaleDateString('ar-TN')}</span>
                  </div>
                  <div className="info-row total">
                    <span className="info-label">الإجمالي:</span>
                    <span className="info-value">{totalPrice.toFixed(2)} دينار</span>
                  </div>
                </div>
                <p className="redirect-message">جاري تحويلك إلى صفحة حجوزاتي...</p>
                <div className="loading-spinner-small"></div>
              </div>
            ) : bookingError ? (
              // رسالة خطأ
              <div className="error-message">
                <div className="error-icon">❌</div>
                <h2>فشل إنشاء الحجز</h2>
                <div className="error-details">
                  <p>{bookingError}</p>
                </div>
                <button 
                  onClick={() => {
                    setBookingError('');
                  }} 
                  className="try-again-button"
                >
                  حاول مرة أخرى
                </button>
              </div>
            ) : (
              // نموذج الحجز العادي
              <div className="booking-form-wrapper">
                {/* صورة السيارة في الوسط */}
                <div className="car-image-center">
                  {car.images && car.images.length > 0 ? (
                    <img 
                      src={car.images[0]} 
                      alt={`${car.brand} ${car.model}`} 
                      className="booking-car-image-center" 
                    />
                  ) : (
                    <div className="no-image-center">🚗</div>
                  )}
                </div>

                {/* معلومات السيارة في الوسط */}
                <div className="car-info-center">
                  <h2 className="car-name-center">{car.brand} {car.model}</h2>
                  <p className="car-year-center">{car.year}</p>
                  
                  <div className="info-cards-center">
                    <div className="info-card-center">
                      <span className="info-icon">💰</span>
                      <span className="info-label-center">السعر اليومي</span>
                      <span className="info-value-center">{car.pricePerDay} دينار</span>
                    </div>
                    
                    <div className="info-card-center">
                      <span className="info-icon">📍</span>
                      <span className="info-label-center">الموقع</span>
                      <span className="info-value-center">{car.location}</span>
                    </div>
                    
                    <div className="info-card-center">
                      <span className="info-icon">👤</span>
                      <span className="info-label-center">المالك</span>
                      <span className="info-value-center">{car.ownerId?.name}</span>
                    </div>
                  </div>
                </div>

                {/* نموذج الحجز في الوسط */}
                <form onSubmit={handleBooking} className="booking-form-center">
                  <div className="dates-container-center">
                    <div className="date-group-center">
                      <label>تاريخ البداية</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={today}
                        required
                      />
                    </div>
                    
                    <div className="date-group-center">
                      <label>تاريخ النهاية</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || today}
                        required
                      />
                    </div>
                  </div>

                  {totalPrice > 0 && (
                    <div className="price-breakdown-center">
                      <h3>تفاصيل السعر</h3>
                      <div className="price-item-center">
                        <span>المدة:</span>
                        <span>{Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} أيام</span>
                      </div>
                      <div className="price-item-center">
                        <span>السعر اليومي:</span>
                        <span>{car.pricePerDay} دينار</span>
                      </div>
                      <div className="price-item-center">
                        <span>المجموع الفرعي:</span>
                        <span>{(totalPrice / 1.1).toFixed(2)} دينار</span>
                      </div>
                      <div className="price-item-center">
                        <span>رسوم الخدمة (10%):</span>
                        <span>{(totalPrice * 0.1).toFixed(2)} دينار</span>
                      </div>
                      <div className="price-item-center total">
                        <span>الإجمالي:</span>
                        <span>{totalPrice.toFixed(2)} دينار</span>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={bookingLoading || !startDate || !endDate}
                    className="book-button-center"
                  >
                    {bookingLoading ? 'جاري الحجز...' : 'تأكيد الحجز'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal رفع الوثائق */}
      <ModalUpload 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </>
  );
};

export default Booking;