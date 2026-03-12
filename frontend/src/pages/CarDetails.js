import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import './CarDetails.css';

const CarDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // ===== قسم التقييمات =====
  const [reviews, setReviews] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({ average: 0, total: 0, distribution: {} });
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { data } = await API.get(`/cars/${id}`);
        setCar(data.data);
      } catch (err) {
        console.error('Error fetching car:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  // جلب التقييمات
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await API.get(`/reviews/car/${id}`);
        setReviews(data.data.reviews || []);
        setReviewsStats(data.data.stats || { average: 0, total: 0, distribution: {} });
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [id]);

  if (loading) return <><Navbar /><div className="loading">جاري التحميل...</div></>;
  if (!car) return <><Navbar /><div className="loading">السيارة غير موجودة</div></>;

  const pricePerDay = car.pricePerDay || car.daily_price || 0;
  const deposit = car.deposit || car.caution_amount || 0;
  const ownerName = car.ownerId?.name || 'غير محدد';
  const isIndividual = car.ownerId?.role !== 'company';
  const isOwner = user && car.ownerId?._id === user._id;

  return (
    <>
      <Navbar />
      <div className="car-details-page">
        <div className="car-details-container">
          <h1 className="car-details-title">{car.brand} {car.model} ({car.year})</h1>
          
          {/* معرض الصور في الوسط */}
          <div className="car-gallery">
            <div className="main-image-container">
              {car.images && car.images.length > 0 ? (
                <img 
                  src={car.images[selectedImage]} 
                  alt={`${car.brand} ${car.model}`} 
                  className="main-image" 
                />
              ) : (
                <div className="no-image">لا توجد صور</div>
              )}
            </div>
            
            {car.images && car.images.length > 1 && (
              <div className="image-thumbnails">
                {car.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img} alt={`${car.brand} ${car.model} ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* معلومات السيارة في الوسط */}
          <div className="car-info-center">
            <div className="info-grid">
              <div className="info-card">
                <span className="info-icon">💰</span>
                <span className="info-label">السعر اليومي</span>
                <span className="info-value">{pricePerDay} دينار</span>
              </div>
              
              <div className="info-card">
                <span className="info-icon">🔒</span>
                <span className="info-label">مبلغ الضمان</span>
                <span className="info-value">{deposit} دينار</span>
              </div>
              
              <div className="info-card">
                <span className="info-icon">📍</span>
                <span className="info-label">الموقع</span>
                <span className="info-value">{car.location}</span>
              </div>
              
              <div className="info-card">
                <span className="info-icon">⛽</span>
                <span className="info-label">نوع الوقود</span>
                <span className="info-value">
                  {car.fuelType === 'petrol' ? 'بنزين' : 
                   car.fuelType === 'diesel' ? 'ديزل' : 
                   car.fuelType === 'electric' ? 'كهرباء' : 'هايبرد'}
                </span>
              </div>
              
              <div className="info-card">
                <span className="info-icon">🪑</span>
                <span className="info-label">عدد المقاعد</span>
                <span className="info-value">{car.seats}</span>
              </div>
              
              <div className="info-card">
                <span className="info-icon">👤</span>
                <span className="info-label">المالك</span>
                <span className="info-value">{ownerName}</span>
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="additional-info">
              <p><strong>رقم اللوحة:</strong> {car.licensePlate}</p>
              {isIndividual && <p className="owner-type">(مالك فرد)</p>}
            </div>

            {/* عرض العقد إذا كان المالك فرداً */}
            {isIndividual && car.contractPdf && (
              <div className="contract-section">
                <h3>📄 عقد الكراء</h3>
                <p>يمكنك الاطلاع على العقد قبل الحجز:</p>
                <a 
                  href={car.contractPdf} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contract-button"
                >
                  📥 عرض العقد (PDF)
                </a>
              </div>
            )}

            {/* أزرار الإجراءات في الوسط */}
            <div className="action-buttons">
              {!user ? (
                <Link to="/login" className="action-button login-button">
                  تسجيل الدخول للحجز
                </Link>
              ) : isOwner ? (
                <div className="owner-message">🚗 هذه سيارتك الخاصة</div>
              ) : user.verificationStatus !== 'approved' ? (
                <div className="verification-warning">
                  <p>⚠️ يجب توثيق حسابك قبل الحجز</p>
                  <Link to="/upload-docs" className="action-button verify-button">
                    توثيق الحساب الآن
                  </Link>
                </div>
              ) : (
                <Link to={`/booking/${car._id}`} className="action-button book-button">
                  احجز الآن
                </Link>
              )}
            </div>
          </div>

          {/* ===== قسم التقييمات ===== */}
          <div className="reviews-section">
            <h3>التقييمات ({reviewsStats.total})</h3>
            
            {reviewsStats.total > 0 && (
              <div className="reviews-summary">
                <div className="average-rating">
                  <span className="average-number">{reviewsStats.average}</span>
                  <div className="average-stars">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className={star <= Math.round(reviewsStats.average) ? 'star-filled' : 'star-empty'}>★</span>
                    ))}
                  </div>
                </div>
                
                <div className="rating-distribution">
                  {[5,4,3,2,1].map(rating => (
                    <div key={rating} className="distribution-row">
                      <span className="rating-label">{rating} ★</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${reviewsStats.total ? ((reviewsStats.distribution[rating] || 0) / reviewsStats.total * 100) : 0}%` }}
                        ></div>
                      </div>
                      <span className="rating-count">{reviewsStats.distribution[rating] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loadingReviews ? (
              <p className="loading-reviews">جاري تحميل التقييمات...</p>
            ) : reviews.length === 0 ? (
              <p className="no-reviews">لا توجد تقييمات بعد</p>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <strong className="reviewer-name">{review.reviewerId?.name || 'مستخدم'}</strong>
                      <div className="review-rating">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} className={star <= review.rating ? 'star-filled' : 'star-empty'}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <small className="review-date">{new Date(review.createdAt).toLocaleDateString('ar-TN')}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CarDetails;