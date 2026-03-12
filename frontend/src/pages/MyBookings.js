import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import API from '../services/api';
import { showError } from '../utils/ToastConfig';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      console.log('📋 Fetching my bookings...');
      const { data } = await API.get('/bookings/my-bookings');
      console.log('✅ Bookings fetched:', data.data);
      setBookings(data.data || []);
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      showError('فشل تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: '#fff3cd', color: '#856404', text: 'قيد الانتظار' };
      case 'approved': return { bg: '#d4edda', color: '#155724', text: 'مؤكد' };
      case 'rejected': return { bg: '#f8d7da', color: '#721c24', text: 'مرفوض' };
      case 'completed': return { bg: '#cce5ff', color: '#004085', text: 'مكتمل' };
      case 'cancelled': return { bg: '#e2e3e5', color: '#383d41', text: 'ملغي' };
      default: return { bg: '#e2e3e5', color: '#383d41', text: status };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-TN');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري تحميل الحجوزات...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="my-bookings-container">
        <h1 className="my-bookings-title">حجوزاتي</h1>
        
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>لا توجد حجوزات حتى الآن</p>
            <Link to="/cars" className="browse-link">تصفح السيارات</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => {
              const status = getStatusColor(booking.status);
              const days = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.carId?.brand} {booking.carId?.model} ({booking.carId?.year})</h3>
                    <span className="status-badge" style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.text}
                    </span>
                  </div>
                  
                  <div className="booking-details">
                    <p><strong>من:</strong> {formatDate(booking.startDate)}</p>
                    <p><strong>إلى:</strong> {formatDate(booking.endDate)}</p>
                    <p><strong>المدة:</strong> {days} أيام</p>
                    <p><strong>السعر الإجمالي:</strong> {booking.totalPrice} دينار</p>
                  </div>

                  <div className="booking-actions">
                    <Link to={`/car/${booking.carId?._id}`} className="view-car-button">
                      عرض السيارة
                    </Link>
                    
                    {booking.status === 'approved' && (
                      <Link to={`/messages/${booking._id}`} className="message-button">
                        💬 المحادثة
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MyBookings;