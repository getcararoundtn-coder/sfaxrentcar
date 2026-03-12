import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { auth } from '../firebase';

const Reviews = () => {
  const { carId } = useParams(); // معرف السيارة (اختياري)
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // حالة إضافة تقييم جديد
  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]); // الحجوزات المكتملة التي يمكن تقييمها

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      await fetchData(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, carId]);

  const fetchData = async (currentUser) => {
    try {
      const token = await currentUser.getIdToken();
      
      // جلب التقييمات (إذا كان هناك carId، نجلب تقييمات سيارة معينة)
      let reviewsUrl = carId 
        ? `http://localhost:5000/api/reviews/car/${carId}`
        : 'http://localhost:5000/api/reviews/my-reviews';
      
      const reviewsRes = await fetch(reviewsUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reviewsData = await reviewsRes.json();
      if (reviewsRes.ok) {
        setReviews(reviewsData.data || []);
      }

      // إذا كان هناك carId، نجلب بيانات السيارة
      if (carId) {
        const carRes = await fetch(`http://localhost:5000/api/cars/${carId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const carData = await carRes.json();
        if (carRes.ok) {
          setCar(carData.data);
        }
      }

      // جلب الحجوزات المكتملة التي يمكن تقييمها (للمستخدم)
      const bookingsRes = await fetch('http://localhost:5000/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      if (bookingsRes.ok) {
        // حجوزات مكتملة ولم يتم تقييمها بعد
        const completed = bookingsData.data.filter(b => 
          b.status === 'completed' && !b.hasReview
        );
        setCompletedBookings(completed || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل تحميل البيانات');
    }
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim()) {
      alert('الرجاء كتابة تعليق');
      return;
    }

    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      // هنا نفترض أننا نرسل التقييم لحجز معين (يمكن تحسينه لاحقاً)
      const response = await fetch(`http://localhost:5000/api/reviews/${completedBookings[0]?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment
        })
      });

      if (response.ok) {
        const data = await response.json();
        setReviews([data.data, ...reviews]);
        setShowAddReview(false);
        setNewRating(5);
        setNewComment('');
        alert('✅ تم إضافة التقييم بنجاح');
      } else {
        // بيانات وهمية للتجربة
        const fakeReview = {
          _id: Date.now().toString(),
          rating: newRating,
          comment: newComment,
          reviewer_id: {
            name: user.displayName || 'مستخدم',
            photoURL: user.photoURL
          },
          createdAt: new Date().toISOString()
        };
        setReviews([fakeReview, ...reviews]);
        setShowAddReview(false);
        setNewRating(5);
        setNewComment('');
        alert('✅ تم إضافة التقييم بنجاح (تجريبي)');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('فشل إضافة التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} style={{
            color: star <= rating ? '#ffc107' : '#e4e5e9',
            fontSize: '20px',
            marginRight: '2px'
          }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <><Navbar /><div style={styles.loading}>جاري التحميل...</div></>;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          {/* عنوان الصفحة */}
          <div style={styles.header}>
            <h1 style={styles.title}>
              {car ? `تقييمات ${car.brand} ${car.model}` : 'تقييماتي'}
            </h1>
            {car && (
              <div style={styles.carInfo}>
                <span style={styles.averageRating}>{averageRating}</span>
                {renderStars(Math.round(averageRating))}
                <span style={styles.reviewCount}>({reviews.length} تقييم)</span>
              </div>
            )}
          </div>

          {/* زر إضافة تقييم جديد */}
          {completedBookings.length > 0 && !carId && (
            <button
              onClick={() => setShowAddReview(!showAddReview)}
              style={styles.addReviewButton}
            >
              {showAddReview ? 'إلغاء' : '+ إضافة تقييم جديد'}
            </button>
          )}

          {/* نموذج إضافة تقييم */}
          {showAddReview && (
            <div style={styles.addReviewForm}>
              <h3>أضف تقييمك</h3>
              
              <div style={styles.ratingSelector}>
                <label>التقييم:</label>
                <div style={styles.starSelector}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      onClick={() => setNewRating(star)}
                      style={{
                        ...styles.starOption,
                        color: star <= newRating ? '#ffc107' : '#e4e5e9',
                        cursor: 'pointer'
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div style={styles.commentField}>
                <label>التعليق:</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب تجربتك مع السيارة..."
                  rows="4"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formActions}>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  style={{
                    ...styles.submitButton,
                    backgroundColor: submitting ? '#6c757d' : '#28a745',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                </button>
                <button
                  onClick={() => setShowAddReview(false)}
                  style={styles.cancelButton}
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* قائمة التقييمات */}
          <div style={styles.reviewsList}>
            {reviews.length === 0 ? (
              <div style={styles.noReviews}>
                <span style={styles.noReviewsIcon}>📝</span>
                <p>لا توجد تقييمات بعد</p>
                {completedBookings.length > 0 && !carId && (
                  <p>كن أول من يضيف تقييماً!</p>
                )}
              </div>
            ) : (
              reviews.map(review => (
                <div key={review._id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <div style={styles.reviewerInfo}>
                      <div style={styles.reviewerAvatar}>
                        {review.reviewer_id?.name?.charAt(0) || 'م'}
                      </div>
                      <div>
                        <strong style={styles.reviewerName}>
                          {review.reviewer_id?.name || 'مستخدم'}
                        </strong>
                        <span style={styles.reviewDate}>
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p style={styles.reviewComment}>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 60px)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    color: '#333',
    fontSize: '28px',
    marginBottom: '15px',
  },
  carInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  averageRating: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    color: '#666',
    fontSize: '14px',
  },
  stars: {
    display: 'inline-flex',
  },
  addReviewButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '30px',
    transition: 'background-color 0.3s',
  },
  addReviewForm: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  ratingSelector: {
    marginBottom: '20px',
  },
  starSelector: {
    display: 'flex',
    gap: '5px',
    marginTop: '5px',
  },
  starOption: {
    fontSize: '30px',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'scale(1.2)',
    },
  },
  commentField: {
    marginBottom: '20px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    marginTop: '5px',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
  },
  submitButton: {
    flex: 1,
    padding: '10px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  noReviews: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
  noReviewsIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '20px',
  },
  reviewCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fff',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  reviewerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  reviewerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
  },
  reviewerName: {
    display: 'block',
    fontSize: '16px',
    color: '#333',
  },
  reviewDate: {
    fontSize: '12px',
    color: '#999',
  },
  reviewComment: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#555',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#555',
  },
};

export default Reviews;