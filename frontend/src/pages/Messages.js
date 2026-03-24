import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import API from '../services/api';
import { showError } from '../utils/ToastConfig';
import './Messages.css';

const Messages = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [carInfo, setCarInfo] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [canChat, setCanChat] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await API.get('/messages/conversations');
      setConversations(data.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!bookingId) return;
    
    try {
      console.log('📤 Fetching messages for booking:', bookingId);
      const { data } = await API.get(`/messages/booking/${bookingId}`);
      console.log('✅ Response:', data);
      
      if (data.success) {
        // ✅ تحويل الرسائل لقراءة كلاً من message و text
        const formattedMessages = (data.data.messages || []).map(msg => ({
          ...msg,
          message: msg.message || msg.text || '', // دعم كلا الحقلين
          text: msg.text || msg.message || ''
        }));
        
        setMessages(formattedMessages);
        setBookingInfo(data.data.booking);
        setCarInfo(data.data.car);
        setOtherUser(data.data.otherUser);
        setCanChat(data.data.booking?.canChat || false);
        
        console.log('✅ Messages loaded:', formattedMessages.length);
      }
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      if (err.response?.status === 403) {
        setError(err.response?.data?.message || 'Vous ne pouvez pas accéder à cette conversation');
      } else {
        setError('Impossible de charger les messages');
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      fetchMessages();
    } else {
      fetchConversations();
    }
  }, [bookingId, fetchMessages, fetchConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!canChat) {
      showError('Vous ne pouvez pas envoyer de messages avant confirmation de la réservation');
      return;
    }
    
    setSending(true);
    try {
      const { data } = await API.post(`/messages/booking/${bookingId}`, { 
        message: newMessage 
      });
      
      if (data.success) {
        const newMsg = {
          ...data.data,
          message: data.data.message || data.data.text || newMessage
        };
        setMessages([...messages, newMsg]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      showError(err.response?.data?.message || 'Échec de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'En attente de confirmation';
      case 'accepted': return 'Réservation confirmée ✅';
      case 'approved': return 'Réservation confirmée ✅';
      case 'ongoing': return 'Location en cours';
      case 'completed': return 'Location terminée';
      case 'cancelled': return 'Annulée';
      case 'refused': return 'Refusée';
      default: return status;
    }
  };

  // صفحة قائمة المحادثات
  if (!bookingId) {
    return (
      <>
        <Navbar />
        <div className="messages-page">
          <div className="conversations-container">
            <h1 className="conversations-title">Messages</h1>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement des conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="empty-conversations">
                <div className="empty-icon">💬</div>
                <h3>Aucune conversation</h3>
                <p>Les messages apparaîtront ici après confirmation de vos réservations</p>
                <Link to="/my-bookings" className="browse-link">Voir mes réservations</Link>
              </div>
            ) : (
              <div className="conversations-list">
                {conversations.map((conv) => (
                  <div
                    key={conv.bookingId}
                    className={`conversation-card ${conv.unreadCount > 0 ? 'unread' : ''}`}
                    onClick={() => navigate(`/messages/${conv.bookingId}`)}
                  >
                    <div className="conversation-avatar">
                      {conv.carImage ? (
                        <img src={conv.carImage} alt={conv.carName} />
                      ) : (
                        <div className="avatar-placeholder">🚗</div>
                      )}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h3>{conv.carName}</h3>
                        {conv.unreadCount > 0 && (
                          <span className="unread-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                      <p className="conversation-last-message">
                        {conv.lastMessage ? (
                          <>
                            <strong>{conv.lastMessage.sender}:</strong> {conv.lastMessage.text}
                          </>
                        ) : (
                          "Nouvelle conversation"
                        )}
                      </p>
                      {conv.dates && conv.dates.start && conv.dates.end && (
                        <p className="conversation-dates">
                          📅 {formatFullDate(conv.dates.start)} - {formatFullDate(conv.dates.end)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // صفحة المحادثة
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="messages-page-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des messages...</p>
        </div>
      </>
    );
  }

  if (error && !canChat) {
    return (
      <>
        <Navbar />
        <div className="messages-page-error">
          <div className="error-container">
            <div className="error-icon">🔒</div>
            <h2>Conversation non disponible</h2>
            <p>{error}</p>
            <Link to="/my-bookings" className="back-button">
              ← Retour à mes réservations
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="messages-page">
        <div className="messages-container">
          <div className="messages-header">
            <div className="header-left">
              <button onClick={() => navigate('/messages')} className="back-button">
                ←
              </button>
              <div className="car-info">
                {carInfo?.image && (
                  <img src={carInfo.image} alt={carInfo.name} className="car-avatar" />
                )}
                <div>
                  <h2>{carInfo?.name || 'Voiture'}</h2>
                  {bookingInfo && (
                    <p className="booking-dates">
                      📅 {formatFullDate(bookingInfo.startDate)} - {formatFullDate(bookingInfo.endDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className={`status-badge ${bookingInfo?.status}`}>
              {getStatusText(bookingInfo?.status)}
            </div>
          </div>

          <div className="messages-area" ref={chatContainerRef}>
            {messages.length === 0 ? (
              <div className="empty-messages">
                <div className="empty-icon">💬</div>
                <h3>Aucun message</h3>
                <p>Soyez le premier à envoyer un message</p>
                {!canChat && (
                  <p className="chat-hint">
                    Les messages seront disponibles après confirmation de votre réservation
                  </p>
                )}
              </div>
            ) : (
              messages.map((msg, index) => {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const isMe = msg.senderId?._id === currentUser?._id;
                // ✅ استخدام message الذي يحتوي على المحتوى من كلا الحقلين
                const messageContent = msg.message || msg.text || '';
                return (
                  <div
                    key={msg._id || index}
                    className={`message ${isMe ? 'sent' : 'received'}`}
                  >
                    {!isMe && (
                      <div className="message-sender">
                        {otherUser?.name || 'Utilisateur'}
                      </div>
                    )}
                    <div className="message-bubble">
                      <div className="message-text">{messageContent}</div>
                      <div className="message-time">
                        {formatMessageDate(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="messages-input-area">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={canChat ? "Écrivez votre message..." : "Les messages seront disponibles après confirmation"}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={!canChat || sending}
              className="message-input"
            />
            <button
              onClick={sendMessage}
              disabled={!canChat || sending || !newMessage.trim()}
              className={`send-button ${(!canChat || sending || !newMessage.trim()) ? 'disabled' : ''}`}
            >
              {sending ? '...' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;