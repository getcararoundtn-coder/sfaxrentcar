import React, { useState } from 'react';

const MessagesTab = ({ messages = [], onReply, onDelete }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // دالة مساعدة لاستخراج آخر 6 أحرف من معرف الحجز بأمان
  const getBookingIdShort = (bookingId) => {
    if (!bookingId) return '';
    if (typeof bookingId === 'string') return bookingId.slice(-6);
    if (bookingId._id && typeof bookingId._id === 'string') return bookingId._id.slice(-6);
    if (bookingId.toString) return bookingId.toString().slice(-6);
    return '...';
  };

  if (!messages || messages.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>💬</span>
        <h3 style={styles.emptyTitle}>لا توجد رسائل</h3>
        <p style={styles.emptyText}>لم يتم إرسال أي رسائل بعد</p>
      </div>
    );
  }

  // تصفية الرسائل حسب الحالة والبحث
  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread' && msg.read) return false;
    if (filter === 'read' && !msg.read) return false;
    
    if (searchTerm) {
      const senderName = msg.senderId?.name?.toLowerCase() || '';
      const senderEmail = msg.senderId?.email?.toLowerCase() || '';
      const content = msg.text?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return senderName.includes(term) || senderEmail.includes(term) || content.includes(term);
    }
    
    return true;
  });

  const getMessageTypeIcon = (type) => {
    switch(type) {
      case 'complaint': return '⚠️';
      case 'suggestion': return '💡';
      case 'inquiry': return '❓';
      case 'support': return '🆘';
      default: return '💬';
    }
  };

  const getMessageTypeText = (type) => {
    switch(type) {
      case 'complaint': return 'شكوى';
      case 'suggestion': return 'اقتراح';
      case 'inquiry': return 'استفسار';
      case 'support': return 'دعم فني';
      default: return 'رسالة عامة';
    }
  };

  const getMessageTypeColor = (type) => {
    switch(type) {
      case 'complaint': return { bg: '#f8d7da', color: '#721c24' };
      case 'suggestion': return { bg: '#d4edda', color: '#155724' };
      case 'inquiry': return { bg: '#cce5ff', color: '#004085' };
      case 'support': return { bg: '#fff3cd', color: '#856404' };
      default: return { bg: '#e2e3e5', color: '#383d41' };
    }
  };

  const handleReplyClick = (message) => {
    setSelectedMessage(message);
    setShowReplyModal(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      alert('الرجاء كتابة الرد');
      return;
    }
    
    onReply(selectedMessage._id, replyText);
    setShowReplyModal(false);
    setReplyText('');
    setSelectedMessage(null);
  };

  const handleDelete = (messageId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      onDelete(messageId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days === 1) return 'أمس';
    if (days < 7) return `منذ ${days} أيام`;
    return date.toLocaleDateString('ar-TN');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>💬 إدارة الرسائل والشكاوى</h2>
        <p style={styles.subtitle}>
          إجمالي الرسائل: {messages.length} | 
          غير مقروءة: {messages.filter(m => !m.read).length} |
          تم الرد: {messages.filter(m => m.reply).length}
        </p>
      </div>

      {/* شريط التصفية والبحث */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>تصفية حسب:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">جميع الرسائل</option>
            <option value="unread">غير مقروءة</option>
            <option value="read">مقروءة</option>
          </select>
        </div>

        <div style={styles.searchGroup}>
          <input
            type="text"
            placeholder="🔍 بحث في الرسائل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div style={styles.statsCards}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{messages.length}</span>
          <span style={styles.statLabel}>إجمالي الرسائل</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{messages.filter(m => !m.read).length}</span>
          <span style={styles.statLabel}>غير مقروءة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{messages.filter(m => m.reply).length}</span>
          <span style={styles.statLabel}>تم الرد عليها</span>
        </div>
      </div>

      {/* قائمة الرسائل */}
      <div style={styles.messagesList}>
        {filteredMessages.length === 0 ? (
          <div style={styles.noResults}>
            <p>لا توجد رسائل تطابق البحث</p>
          </div>
        ) : (
          filteredMessages.map(message => {
            const typeStyle = getMessageTypeColor(message.type);
            
            return (
              <div 
                key={message._id} 
                style={{
                  ...styles.messageCard,
                  backgroundColor: message.read ? 'white' : '#f0f7ff',
                  borderRight: message.read ? 'none' : '4px solid #007bff'
                }}
              >
                <div style={styles.messageHeader}>
                  <div style={styles.messageType}>
                    <span style={styles.messageIcon}>{getMessageTypeIcon(message.type)}</span>
                    <span style={{
                      ...styles.typeBadge,
                      backgroundColor: typeStyle.bg,
                      color: typeStyle.color,
                    }}>
                      {getMessageTypeText(message.type)}
                    </span>
                  </div>
                  <span style={styles.messageTime}>{formatDate(message.createdAt)}</span>
                </div>

                <div style={styles.messageSender}>
                  <div style={styles.senderInfo}>
                    <div style={styles.senderAvatar}>
                      {message.senderId?.name?.charAt(0) || 'م'}
                    </div>
                    <div>
                      <strong style={styles.senderName}>
                        {message.senderId?.name || 'مستخدم غير معروف'}
                      </strong>
                      <span style={styles.senderEmail}>{message.senderId?.email || ''}</span>
                    </div>
                  </div>
                  {message.bookingId && (
                    <span style={styles.bookingBadge}>
                      حجز #{getBookingIdShort(message.bookingId)}
                    </span>
                  )}
                </div>

                <div style={styles.messageContent}>
                  <p style={styles.messageText}>
                    {message.text && message.text.length > 100 
                      ? message.text.substring(0, 100) + '...' 
                      : message.text}
                  </p>
                  {message.text && message.text.length > 100 && (
                    <button 
                      onClick={() => {
                        setSelectedMessage(message);
                        setShowMessageModal(true);
                      }}
                      style={styles.readMoreButton}
                    >
                      عرض المزيد
                    </button>
                  )}
                </div>

                {message.reply && (
                  <div style={styles.replyBox}>
                    <div style={styles.replyHeader}>
                      <span style={styles.replyIcon}>↩️</span>
                      <strong>الرد:</strong>
                    </div>
                    <p style={styles.replyText}>
                      {message.reply.length > 100 
                        ? message.reply.substring(0, 100) + '...' 
                        : message.reply}
                    </p>
                    {message.repliedAt && (
                      <span style={styles.replyTime}>
                        {new Date(message.repliedAt).toLocaleDateString('ar-TN')}
                      </span>
                    )}
                  </div>
                )}

                <div style={styles.messageActions}>
                  {!message.read && (
                    <span style={styles.unreadBadge}>جديد</span>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedMessage(message);
                      setShowMessageModal(true);
                    }}
                    style={styles.viewButton}
                    title="عرض التفاصيل"
                  >
                    👁️ عرض
                  </button>
                  <button 
                    onClick={() => handleReplyClick(message)}
                    style={styles.replyButton}
                    title="رد على الرسالة"
                  >
                    ↩️ رد
                  </button>
                  <button 
                    onClick={() => handleDelete(message._id)}
                    style={styles.deleteButton}
                    title="حذف الرسالة"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal عرض تفاصيل الرسالة كاملة */}
      {showMessageModal && selectedMessage && (
        <div style={styles.modal} onClick={() => setShowMessageModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>تفاصيل الرسالة</h3>
              <button 
                onClick={() => setShowMessageModal(false)}
                style={styles.modalCloseButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.messageDetail}>
                <div style={styles.messageDetailHeader}>
                  <span style={styles.messageDetailIcon}>
                    {getMessageTypeIcon(selectedMessage.type)}
                  </span>
                  <strong style={styles.messageDetailType}>
                    {getMessageTypeText(selectedMessage.type)}
                  </strong>
                </div>

                <div style={styles.messageDetailInfo}>
                  <p><strong>من:</strong> {selectedMessage.senderId?.name || 'غير معروف'}</p>
                  <p><strong>البريد:</strong> {selectedMessage.senderId?.email || 'غير معروف'}</p>
                  <p><strong>التاريخ:</strong> {new Date(selectedMessage.createdAt).toLocaleDateString('ar-TN')}</p>
                  <p><strong>الوقت:</strong> {new Date(selectedMessage.createdAt).toLocaleTimeString('ar-TN')}</p>
                  {selectedMessage.bookingId && (
                    <p><strong>رقم الحجز:</strong> {getBookingIdShort(selectedMessage.bookingId)}</p>
                  )}
                </div>

                <div style={styles.messageDetailContent}>
                  <h4 style={styles.messageDetailSubtitle}>محتوى الرسالة:</h4>
                  <p style={styles.messageDetailText}>{selectedMessage.text}</p>
                </div>

                {selectedMessage.reply && (
                  <div style={styles.messageDetailReply}>
                    <h4 style={styles.messageDetailSubtitle}>الرد:</h4>
                    <p style={styles.messageDetailReplyText}>{selectedMessage.reply}</p>
                    {selectedMessage.repliedAt && (
                      <p style={styles.replyDate}>
                        {new Date(selectedMessage.repliedAt).toLocaleDateString('ar-TN')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div style={styles.modalActions}>
                <button 
                  onClick={() => {
                    setShowMessageModal(false);
                    handleReplyClick(selectedMessage);
                  }}
                  style={styles.modalReplyButton}
                >
                  ↩️ رد على الرسالة
                </button>
                <button 
                  onClick={() => setShowMessageModal(false)}
                  style={styles.modalCloseBtn}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal الرد على الرسالة */}
      {showReplyModal && selectedMessage && (
        <div style={styles.modal} onClick={() => setShowReplyModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>الرد على الرسالة</h3>
              <button 
                onClick={() => setShowReplyModal(false)}
                style={styles.modalCloseButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.originalMessageBox}>
                <div style={styles.originalMessageHeader}>
                  <span style={styles.originalMessageIcon}>
                    {getMessageTypeIcon(selectedMessage.type)}
                  </span>
                  <strong>{selectedMessage.senderId?.name || 'مستخدم'}</strong>
                  <span style={styles.originalMessageDate}>
                    {new Date(selectedMessage.createdAt).toLocaleDateString('ar-TN')}
                  </span>
                </div>
                <p style={styles.originalMessageText}>{selectedMessage.text}</p>
              </div>

              <div style={styles.replyForm}>
                <label style={styles.replyLabel}>الرد:</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  rows="6"
                  style={styles.replyTextarea}
                  autoFocus
                />
              </div>

              <div style={styles.replyActions}>
                <button 
                  onClick={handleSendReply}
                  style={styles.sendButton}
                >
                  إرسال الرد
                </button>
                <button 
                  onClick={() => setShowReplyModal(false)}
                  style={styles.cancelButton}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '24px',
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  filterLabel: {
    fontSize: '14px',
    color: '#333',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  searchGroup: {
    flex: 1,
    maxWidth: '300px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  statsCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statValue: {
    display: 'block',
    fontSize: '24px',
    fontWeight: '600',
    color: '#007bff',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
  messagesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  messageCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    transition: 'box-shadow 0.3s',
    ':hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  messageType: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  messageIcon: {
    fontSize: '20px',
  },
  typeBadge: {
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  messageTime: {
    fontSize: '12px',
    color: '#999',
  },
  messageSender: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  senderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  senderAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
  },
  senderName: {
    display: 'block',
    fontSize: '14px',
  },
  senderEmail: {
    fontSize: '12px',
    color: '#666',
  },
  bookingBadge: {
    padding: '4px 8px',
    backgroundColor: '#e7f3ff',
    color: '#004085',
    borderRadius: '4px',
    fontSize: '12px',
  },
  messageContent: {
    marginBottom: '15px',
  },
  messageText: {
    margin: 0,
    lineHeight: '1.6',
    color: '#333',
  },
  readMoreButton: {
    marginTop: '5px',
    padding: '4px 8px',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  replyBox: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '15px',
    borderRight: '3px solid #28a745',
  },
  replyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '5px',
  },
  replyIcon: {
    fontSize: '16px',
  },
  replyText: {
    margin: '0 0 5px 0',
    color: '#555',
  },
  replyTime: {
    fontSize: '11px',
    color: '#999',
  },
  messageActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  unreadBadge: {
    padding: '4px 8px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  replyButton: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '10px',
  },
  emptyText: {
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#333',
  },
  modalCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
  },
  modalBody: {
    padding: '20px',
  },
  originalMessageBox: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  originalMessageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  originalMessageIcon: {
    fontSize: '18px',
  },
  originalMessageDate: {
    fontSize: '12px',
    color: '#999',
    marginLeft: 'auto',
  },
  originalMessageText: {
    margin: 0,
    color: '#333',
    lineHeight: '1.6',
  },
  replyForm: {
    marginBottom: '20px',
  },
  replyLabel: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '600',
    color: '#333',
  },
  replyTextarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    resize: 'vertical',
  },
  replyActions: {
    display: 'flex',
    gap: '10px',
  },
  sendButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
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
  messageDetail: {
    padding: '10px',
  },
  messageDetailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  messageDetailIcon: {
    fontSize: '24px',
  },
  messageDetailType: {
    fontSize: '18px',
  },
  messageDetailInfo: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  messageDetailContent: {
    marginBottom: '20px',
  },
  messageDetailSubtitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    color: '#333',
  },
  messageDetailText: {
    margin: 0,
    lineHeight: '1.8',
    color: '#333',
    whiteSpace: 'pre-wrap',
  },
  messageDetailReply: {
    backgroundColor: '#f0f7ff',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '20px',
  },
  messageDetailReplyText: {
    margin: '10px 0',
    color: '#004085',
  },
  replyDate: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'left',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  modalReplyButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  modalCloseBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default MessagesTab;