import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import API from '../services/api';

const Messages = () => {
  const { bookingId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [booking, setBooking] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await API.get(`/messages/${bookingId}`);
      setMessages(data.data);
      
      // جلب معلومات الحجز
      if (!booking) {
        const bookingRes = await API.get(`/bookings/${bookingId}`);
        setBooking(bookingRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [bookingId, booking]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // تحديث كل 5 ثوان
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const { data } = await API.post('/messages', { 
        bookingId, 
        text: newMessage 
      });
      setMessages([...messages, data.data]);
      setNewMessage('');
    } catch (err) {
      alert('فشل إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <><Navbar /><div style={styles.loading}>جاري التحميل...</div></>;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>المحادثة</h1>
            {booking && (
              <Link to={`/car/${booking.carId?._id}`} style={styles.carLink}>
                {booking.carId?.brand} {booking.carId?.model}
              </Link>
            )}
          </div>

          <div style={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div style={styles.emptyState}>
                <p>لا توجد رسائل بعد</p>
                <p>ابدأ المحادثة مع الطرف الآخر</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderId?._id === JSON.parse(localStorage.getItem('user'))._id;
                return (
                  <div
                    key={msg._id}
                    style={{
                      ...styles.messageWrapper,
                      justifyContent: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      ...styles.message,
                      backgroundColor: isMe ? '#007bff' : '#f1f3f5',
                      color: isMe ? 'white' : '#333'
                    }}>
                      {!isMe && (
                        <span style={styles.senderName}>
                          {msg.senderId?.name || 'مستخدم'}
                        </span>
                      )}
                      <p style={styles.messageText}>{msg.text}</p>
                      <span style={{
                        ...styles.messageTime,
                        color: isMe ? 'rgba(255,255,255,0.8)' : '#999'
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString('ar-TN')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              style={{
                ...styles.sendButton,
                backgroundColor: sending || !newMessage.trim() ? '#6c757d' : '#28a745',
                cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {sending ? 'جاري...' : 'إرسال'}
            </button>
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
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #ddd'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#333'
  },
  carLink: {
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  emptyState: {
    textAlign: 'center',
    color: '#999',
    marginTop: '50px'
  },
  messageWrapper: {
    display: 'flex',
    width: '100%'
  },
  message: {
    maxWidth: '70%',
    padding: '12px',
    borderRadius: '12px',
    position: 'relative',
    wordBreak: 'break-word'
  },
  senderName: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  messageText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4'
  },
  messageTime: {
    display: 'block',
    fontSize: '10px',
    marginTop: '4px',
    textAlign: 'left'
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '10px',
    borderTop: '1px solid #ddd'
  },
  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px'
  },
  sendButton: {
    padding: '12px 24px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#fff'
  }
};

export default Messages;