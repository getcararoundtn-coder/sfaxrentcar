import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { showError, showWarning } from '../utils/ToastConfig';
import ModalBooking from '../components/ModalBooking';
import ModalUpload from '../components/ModalUpload';
import './CarDetails.css';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ownerRating, setOwnerRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/cars/${id}`);
        setCar(data.data);
        
        // جلب التقييمات مع التأكد من أنها مصفوفة
        try {
          const reviewsRes = await API.get(`/reviews/car/${id}`);
          const reviewsData = reviewsRes.data?.data;
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (reviewErr) {
          console.error('Error fetching reviews:', reviewErr);
          setReviews([]);
        }
        
        // جلب تقييم المؤجر
        if (data.data?.ownerId?._id) {
          try {
            const ownerRes = await API.get(`/users/${data.data.ownerId._id}/rating`);
            setOwnerRating(ownerRes.data.data);
          } catch (ownerErr) {
            console.error('Error fetching owner rating:', ownerErr);
            setOwnerRating({ rating: 0, count: 0, name: data.data.ownerId.name });
          }
        }
      } catch (err) {
        console.error('Error fetching car details:', err);
        showError('فشل تحميل بيانات السيارة');
        navigate('/cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [id, navigate]);

  // حساب السعر عند تغيير التواريخ
  useEffect(() => {
    if (startDate && endDate && car) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        setTotalPrice(car.pricePerDay * days);
      } else {
        setTotalPrice(0);
      }
    }
  }, [startDate, endDate, car]);

  const handleBookingClick = () => {
    if (!user) {
      showWarning('يرجى تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    if (user.verificationStatus !== 'approved') {
      showWarning('يجب توثيق حسابك أولاً (رفع رخصة القيادة)');
      setShowUploadModal(true);
      return;
    }

    if (!startDate || !endDate) {
      showWarning('يرجى اختيار تاريخ البداية والنهاية');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      showError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }

    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    navigate('/my-bookings');
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>★</span>
      );
    }
    return stars;
  };

  // ترجمة طريقة التسليم
  const getDeliveryMethodText = (method) => {
    if (method === 'livraison au client') {
      return { text: '🚚 Livraison au client', description: 'Le propriétaire livre la voiture à l\'adresse du locataire' };
    } else if (method === 'client rencontre le conducteur') {
      return { text: '🤝 Rencontre avec le conducteur', description: 'Le locataire vient récupérer la voiture à l\'adresse indiquée' };
    }
    return { text: method || 'Non spécifié', description: '' };
  };

  // ترجمة نوع الوقود
  const getFuelTypeText = (fuelType) => {
    const fuelMap = {
      'Essence': 'Essence',
      'Diesel': 'Diesel',
      'Hybride': 'Hybride',
      'Électrique': 'Électrique',
      'Autre': 'Autre'
    };
    return fuelMap[fuelType] || fuelType || 'Essence';
  };

  // ترجمة ناقل الحركة
  const getTransmissionText = (transmission) => {
    const transMap = {
      'Manuelle': 'Manuelle',
      'Automatique': 'Automatique'
    };
    return transMap[transmission] || transmission || 'Manuelle';
  };

  const averageRating = Array.isArray(reviews) && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري تحميل بيانات السيارة...</p>
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
          <Link to="/cars" className="back-button">العودة إلى السيارات</Link>
        </div>
      </>
    );
  }

  const deliveryInfo = getDeliveryMethodText(car.deliveryMethod);
  const cautionAmount = car.caution || 500;
  const totalWithCaution = totalPrice + cautionAmount;

  return (
    <>
      <Navbar />
      <div className="car-details-container">
        <div className="car-details-grid">
          {/* قسم الصور */}
          <div className="car-images-section">
            <div className="main-image">
              <img 
                src={car.images?.[selectedImage] || '/default-car.jpg'} 
                alt={`${car.brand} ${car.model}`}
              />
            </div>
            <div className="thumbnail-list">
              {car.images?.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`${car.brand} ${car.model} - ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* معلومات السيارة */}
          <div className="car-info-section">
            <h1 className="car-title">{car.brand} {car.model} ({car.year})</h1>
            
            <div className="car-rating">
              <div className="stars">{renderStars(Math.round(averageRating))}</div>
              <span className="rating-value">{averageRating}</span>
              <span className="review-count">({Array.isArray(reviews) ? reviews.length : 0} avis)</span>
            </div>

            <p className="car-location">
              <span className="icon">📍</span> {car.delegation}, {car.city}
            </p>

            <div className="car-price-box">
              <span className="price">{car.pricePerDay} DT</span>
              <span className="per-day">/ jour</span>
            </div>

            {/* ✅ إضافة مبلغ الضمان (Caution) */}
            <div className="car-caution-box">
              <span className="caution-icon">🔒</span>
              <div className="caution-info">
                <span className="caution-label">Dépôt de garantie (Caution)</span>
                <span className="caution-value">{cautionAmount} DT</span>
                <span className="caution-note">(versé en espèces le jour de la remise des clés)</span>
              </div>
            </div>

            {/* ✅ إضافة طريقة التسليم (Delivery Method) */}
            <div className="car-delivery-box">
              <span className="delivery-icon">🚗</span>
              <div className="delivery-info">
                <span className="delivery-label">{deliveryInfo.text}</span>
                <span className="delivery-description">{deliveryInfo.description}</span>
              </div>
            </div>

            {/* مواصفات السيارة */}
            <div className="car-specs">
              <div className="spec-item">
                <span className="spec-icon">⛽</span>
                <span className="spec-label">Carburant</span>
                <span className="spec-value">{getFuelTypeText(car.fuelType)}</span>
              </div>
              <div className="spec-item">
                <span className="spec-icon">⚙️</span>
                <span className="spec-label">Transmission</span>
                <span className="spec-value">{getTransmissionText(car.transmission)}</span>
              </div>
              <div className="spec-item">
                <span className="spec-icon">👥</span>
                <span className="spec-label">Places</span>
                <span className="spec-value">{car.seats || 5}</span>
              </div>
              <div className="spec-item">
                <span className="spec-icon">🚪</span>
                <span className="spec-label">Portes</span>
                <span className="spec-value">{car.doors || 4}</span>
              </div>
              <div className="spec-item">
                <span className="spec-icon">📊</span>
                <span className="spec-label">Kilométrage</span>
                <span className="spec-value">{car.mileage || '0-15000'} km</span>
              </div>
            </div>

            {/* ✅ عرض المعدات (Features) */}
            {car.features && car.features.length > 0 && (
              <div className="car-features">
                <h3>Équipements</h3>
                <div className="features-list">
                  {car.features.map((feature, idx) => (
                    <span key={idx} className="feature-badge">{feature}</span>
                  ))}
                </div>
              </div>
            )}

            {/* قسم المالك مع التقييم */}
            <div className="car-owner">
              <h3>Propriétaire</h3>
              <div className="owner-info">
                <div className="owner-avatar">
                  {car.ownerId?.name?.charAt(0) || 'U'}
                </div>
                <div className="owner-details">
                  <span className="owner-name">{car.ownerId?.name || 'Utilisateur'}</span>
                  <div className="owner-rating">
                    <span className="stars">{renderStars(Math.round(ownerRating?.rating || 0))}</span>
                    <span className="rating-value">{ownerRating?.rating?.toFixed(1) || 'Nouveau'}</span>
                    <span className="review-count">({ownerRating?.count || 0} avis)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* قسم الحجز */}
          <div className="booking-section">
            <h3>Réserver cette voiture</h3>
            
            <div className="date-fields">
              <div className="date-field">
                <label>Date de début</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                />
              </div>
              <div className="date-field">
                <label>Date de fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                />
              </div>
            </div>

            {totalPrice > 0 && (
              <div className="price-breakdown">
                <div className="breakdown-item">
                  <span>{Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} jours × {car.pricePerDay} DT</span>
                  <span>{totalPrice} DT</span>
                </div>
                {/* ✅ إضافة مبلغ الضمان في تفاصيل السعر */}
                <div className="breakdown-item caution-item">
                  <span>🔒 Caution (remboursable)</span>
                  <span>{cautionAmount} DT</span>
                </div>
                <div className="breakdown-item total">
                  <span>Total à payer</span>
                  <span>{totalWithCaution.toFixed(2)} DT</span>
                </div>
                <div className="caution-note-booking">
                  <small>⚠️ La caution est versée en espèces le jour de la remise des clés et vous sera restituée après la location, sous réserve d'absence de dommages.</small>
                </div>
              </div>
            )}

            <button
              onClick={handleBookingClick}
              disabled={!startDate || !endDate}
              className="book-button"
            >
              Réserver
            </button>

            <p className="booking-note">
              {!user && 'Connectez-vous pour réserver'}
              {user && user.verificationStatus !== 'approved' && 'Vérifiez votre compte pour réserver'}
            </p>
          </div>
        </div>

        {/* قسم التقييمات */}
        <div className="reviews-section">
          <h2>Avis des locataires</h2>
          
          {!Array.isArray(reviews) || reviews.length === 0 ? (
            <p className="no-reviews">Aucun avis pour cette voiture</p>
          ) : (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.reviewerId?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <strong>{review.reviewerId?.name || 'Utilisateur'}</strong>
                        <div className="review-stars">{renderStars(review.rating)}</div>
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal تأكيد الحجز */}
      <ModalBooking
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        car={car}
        startDate={startDate}
        endDate={endDate}
        totalPrice={totalPrice}
        caution={cautionAmount}
        onSuccess={handleBookingSuccess}
      />

      {/* Modal رفع الوثائق */}
      <ModalUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
      <Footer />
    </>
  );
};

export default CarDetails;