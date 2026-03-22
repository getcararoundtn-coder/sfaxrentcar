import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import API from '../services/api';
import { showError, showSuccess } from '../utils/ToastConfig';
import Modal from '../components/Modal';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // حالة الـ Modal للمحادثة
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

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

  // جلب الرسائل لحجز معين
  const fetchMessages = async (bookingId) => {
    try {
      const { data } = await API.get(`/messages/booking/${bookingId}`);
      setMessages(data.data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    }
  };

  // فتح نافذة المحادثة
  const openChat = async (booking) => {
    setSelectedBooking(booking);
    await fetchMessages(booking._id);
    setShowMessageModal(true);
  };

  // إرسال رسالة جديدة
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      const response = await API.post(`/messages/booking/${selectedBooking._id}`, {
        text: newMessage
      });
      
      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setNewMessage('');
        showSuccess('✅ تم إرسال الرسالة');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      showError('فشل إرسال الرسالة');
    } finally {
      setSending(false);
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

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' });
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
                    
                    {/* زر المحادثة - يظهر للحجوزات المؤكدة والمكتملة والمعلقة */}
                    {(booking.status === 'pending' || booking.status === 'approved' || booking.status === 'completed') && (
                      <button 
                        onClick={() => openChat(booking)}
                        className="message-button"
                      >
                        💬 محادثة
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal المحادثة */}
      <Modal 
        isOpen={showMessageModal} 
        onClose={() => setShowMessageModal(false)} 
        title={`محادثة - ${selectedBooking?.carId?.brand} ${selectedBooking?.carId?.model}`}
        size="medium"
      >
        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>لا توجد رسائل بعد</p>
                <p className="chat-hint">ابدأ المحادثة مع المالك</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg._id} className={`chat-message ${msg.senderId === 'me' ? 'sent' : 'received'}`}>
                  <div className="message-content">
                    <p>{msg.text}</p>
                    <span className="message-time">{formatMessageDate(msg.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="chat-input-area">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={sending}
            />
            <button 
              onClick={sendMessage} 
              disabled={sending || !newMessage.trim()}
              className="send-button"
            >
              {sending ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MyBookings;