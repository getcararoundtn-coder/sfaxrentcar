import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { showSuccess, showError } from '../../utils/ToastConfig';
import Modal from '../Modal';

const SupportTab = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get('/admin/support/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  const fetchMessages = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filter !== 'all') params.append('status', filter);
      const { data } = await API.get(`/admin/support/messages?${params}`);
      setMessages(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching messages:', err);
      showError('فشل تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchStats();
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const openMessage = async (message) => {
    try {
      const { data } = await API.get(`/admin/support/messages/${message._id}`);
      setSelectedMessage(data.data);
      setShowReplyModal(true);
    } catch (err) {
      console.error('Error fetching message:', err);
      showError('فشل تحميل تفاصيل الرسالة');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      showError('الرجاء كتابة الرد');
      return;
    }

    try {
      await API.post(`/admin/support/messages/${selectedMessage._id}/reply`, {
        reply: replyText
      });
      showSuccess('✅ تم إرسال الرد بنجاح');
      setShowReplyModal(false);
      setReplyText('');
      fetchMessages(pagination.page);
      fetchStats();
    } catch (err) {
      console.error('Error sending reply:', err);
      showError('فشل إرسال الرد');
    }
  };

  const updateStatus = async (messageId, newStatus) => {
    try {
      await API.patch(`/admin/support/messages/${messageId}/status`, { status: newStatus });
      showSuccess('✅ تم تحديث حالة الرسالة');
      fetchMessages(pagination.page);
      fetchStats();
    } catch (err) {
      console.error('Error updating status:', err);
      showError('فشل تحديث الحالة');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'open': return { text: 'مفتوحة', color: '#28a745', bg: '#d4edda' };
      case 'pending': return { text: 'قيد الانتظار', color: '#ffc107', bg: '#fff3cd' };
      case 'closed': return { text: 'مغلقة', color: '#6c757d', bg: '#e2e3e5' };
      default: return { text: status, color: '#333', bg: '#f8f9fa' };
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return { text: 'عالي', color: '#dc3545', bg: '#f8d7da' };
      case 'medium': return { text: 'متوسط', color: '#ffc107', bg: '#fff3cd' };
      case 'low': return { text: 'منخفض', color: '#28a745', bg: '#d4edda' };
      default: return { text: priority, color: '#333', bg: '#f8f9fa' };
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('ar-TN');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📩 دعم سريع / تواصل معنا</h2>
        <div style={styles.stats}>
          <span style={styles.statBadge}>📬 {stats?.total || 0} إجمالي</span>
          <span style={styles.statBadgeOpen}>🟢 {stats?.open || 0} مفتوحة</span>
          <span style={styles.statBadgePending}>🟡 {stats?.pending || 0} قيد الانتظار</span>
          <span style={styles.statBadgeClosed}>⚫ {stats?.closed || 0} مغلقة</span>
          <span style={styles.statBadgeUnread}>🔴 {stats?.unread || 0} غير مقروءة</span>
        </div>
      </div>

      <div style={styles.filterBar}>
        <button 
          onClick={() => setFilter('all')} 
          style={{...styles.filterBtn, backgroundColor: filter === 'all' ? '#6b46c0' : '#e2e8f0', color: filter === 'all' ? 'white' : '#333'}}
        >
          جميع الرسائل
        </button>
        <button 
          onClick={() => setFilter('open')} 
          style={{...styles.filterBtn, backgroundColor: filter === 'open' ? '#28a745' : '#e2e8f0', color: filter === 'open' ? 'white' : '#333'}}
        >
          مفتوحة
        </button>
        <button 
          onClick={() => setFilter('pending')} 
          style={{...styles.filterBtn, backgroundColor: filter === 'pending' ? '#ffc107' : '#e2e8f0', color: filter === 'pending' ? '#333' : '#333'}}
        >
          قيد الانتظار
        </button>
        <button 
          onClick={() => setFilter('closed')} 
          style={{...styles.filterBtn, backgroundColor: filter === 'closed' ? '#6c757d' : '#e2e8f0', color: filter === 'closed' ? 'white' : '#333'}}
        >
          مغلقة
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>جاري التحميل...</div>
      ) : messages.length === 0 ? (
        <div style={styles.noData}>لا توجد رسائل</div>
      ) : (
        <div style={styles.messagesList}>
          {messages.map(msg => {
            const status = getStatusBadge(msg.status);
            const priority = getPriorityBadge(msg.priority);
            return (
              <div key={msg._id} style={styles.messageCard} onClick={() => openMessage(msg)}>
                <div style={styles.messageHeader}>
                  <div style={styles.messageSender}>
                    <strong>{msg.userName}</strong>
                    <span style={styles.messageEmail}>({msg.userEmail})</span>
                    {msg.userRole === 'company' && <span style={styles.companyBadge}>🚗 Propriétaire</span>}
                  </div>
                  <div style={styles.messageStatus}>
                    <span style={{...styles.statusBadge, backgroundColor: status.bg, color: status.color}}>
                      {status.text}
                    </span>
                    <span style={{...styles.priorityBadge, backgroundColor: priority.bg, color: priority.color}}>
                      {priority.text}
                    </span>
                  </div>
                </div>
                <div style={styles.messageSubject}>
                  <strong>{msg.subject}</strong>
                </div>
                <div style={styles.messagePreview}>
                  {msg.message.length > 100 ? msg.message.substring(0, 100) + '...' : msg.message}
                </div>
                <div style={styles.messageFooter}>
                  <span>{formatDate(msg.createdAt)}</span>
                  {!msg.isRead && <span style={styles.unreadBadge}>جديد</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div style={styles.pagination}>
          <button 
            disabled={pagination.page === 1} 
            onClick={() => fetchMessages(pagination.page - 1)}
            style={styles.pageBtn}
          >
            السابق
          </button>
          <span>صفحة {pagination.page} من {pagination.pages}</span>
          <button 
            disabled={pagination.page === pagination.pages} 
            onClick={() => fetchMessages(pagination.page + 1)}
            style={styles.pageBtn}
          >
            التالي
          </button>
        </div>
      )}

      {/* Modal الرد على الرسالة */}
      <Modal isOpen={showReplyModal} onClose={() => setShowReplyModal(false)} title="الرد على الرسالة" size="medium">
        {selectedMessage && (
          <div>
            <div style={styles.reviewMessage}>
              <div style={styles.reviewHeader}>
                <strong>{selectedMessage.userName}</strong>
                <span>({selectedMessage.userEmail})</span>
              </div>
              <div style={styles.reviewSubject}>
                <strong>الموضوع:</strong> {selectedMessage.subject}
              </div>
              <div style={styles.reviewContent}>
                <strong>الرسالة:</strong>
                <p>{selectedMessage.message}</p>
              </div>
              {selectedMessage.adminReply?.text && (
                <div style={styles.previousReply}>
                  <strong>الرد السابق:</strong>
                  <p>{selectedMessage.adminReply.text}</p>
                  <small>{formatDate(selectedMessage.adminReply.repliedAt)}</small>
                </div>
              )}
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="اكتب ردك هنا..."
              rows={5}
              style={styles.replyTextarea}
            />
            <div style={styles.replyActions}>
              <button onClick={() => updateStatus(selectedMessage._id, 'closed')} style={styles.closeBtn}>
                إغلاق المحادثة
              </button>
              <button onClick={handleReply} style={styles.sendBtn}>
                إرسال الرد
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const styles = {
  container: { padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '24px', color: '#333' },
  stats: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  statBadge: { padding: '5px 12px', borderRadius: '20px', background: '#e2e8f0', color: '#333', fontSize: '14px' },
  statBadgeOpen: { padding: '5px 12px', borderRadius: '20px', background: '#d4edda', color: '#28a745', fontSize: '14px' },
  statBadgePending: { padding: '5px 12px', borderRadius: '20px', background: '#fff3cd', color: '#856404', fontSize: '14px' },
  statBadgeClosed: { padding: '5px 12px', borderRadius: '20px', background: '#e2e3e5', color: '#6c757d', fontSize: '14px' },
  statBadgeUnread: { padding: '5px 12px', borderRadius: '20px', background: '#f8d7da', color: '#dc3545', fontSize: '14px' },
  filterBar: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  messagesList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  messageCard: { background: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s' },
  messageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' },
  messageSender: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  messageEmail: { color: '#666', fontSize: '12px' },
  companyBadge: { background: '#e9ecef', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', color: '#6b46c0' },
  messageStatus: { display: 'flex', gap: '8px' },
  statusBadge: { padding: '2px 10px', borderRadius: '20px', fontSize: '12px' },
  priorityBadge: { padding: '2px 10px', borderRadius: '20px', fontSize: '12px' },
  messageSubject: { marginBottom: '8px' },
  messagePreview: { color: '#666', fontSize: '14px', marginBottom: '8px' },
  messageFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#999' },
  unreadBadge: { background: '#dc3545', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '10px' },
  loading: { textAlign: 'center', padding: '50px', color: '#666' },
  noData: { textAlign: 'center', padding: '50px', color: '#999' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px' },
  pageBtn: { padding: '8px 16px', background: '#6b46c0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  reviewMessage: { background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
  reviewHeader: { marginBottom: '10px', fontWeight: '500' },
  reviewSubject: { marginBottom: '10px' },
  reviewContent: { marginBottom: '10px' },
  previousReply: { marginTop: '15px', padding: '10px', background: '#e9ecef', borderRadius: '8px' },
  replyTextarea: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '15px', resize: 'vertical' },
  replyActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  closeBtn: { padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  sendBtn: { padding: '10px 20px', background: '#6b46c0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default SupportTab;