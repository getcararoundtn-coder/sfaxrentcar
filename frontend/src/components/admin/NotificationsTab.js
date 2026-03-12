import React, { useState } from 'react';

const NotificationsTab = ({ notifications = [], onMarkAsRead, onDelete }) => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');

  if (!notifications || notifications.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>🔔</span>
        <h3 style={styles.emptyTitle}>لا توجد إشعارات</h3>
        <p style={styles.emptyText}>سيتم عرض الإشعارات هنا عند وصولها</p>
      </div>
    );
  }

  // تصفية الإشعارات
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread' && notif.read) return false;
    if (filter === 'read' && !notif.read) return false;
    
    if (searchTerm) {
      const title = notif.title?.toLowerCase() || '';
      const message = notif.message?.toLowerCase() || '';
      const userName = notif.userId?.name?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return title.includes(term) || message.includes(term) || userName.includes(term);
    }
    
    return true;
  });

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'booking_approved': return '✅';
      case 'booking_rejected': return '❌';
      case 'booking_completed': return '✔️';
      case 'booking_cancelled': return '✖️';
      case 'document_verified': return '📄✅';
      case 'document_rejected': return '📄❌';
      case 'car_approved': return '🚗✅';
      case 'car_rejected': return '🚗❌';
      case 'message_reply': return '💬';
      case 'new_user': return '👤';
      default: return '🔔';
    }
  };

  const getNotificationTypeText = (type) => {
    switch(type) {
      case 'booking_approved': return 'تأكيد حجز';
      case 'booking_rejected': return 'رفض حجز';
      case 'booking_completed': return 'اكتمال حجز';
      case 'booking_cancelled': return 'إلغاء حجز';
      case 'document_verified': return 'توثيق وثائق';
      case 'document_rejected': return 'رفض وثائق';
      case 'car_approved': return 'موافقة سيارة';
      case 'car_rejected': return 'رفض سيارة';
      case 'message_reply': return 'رد على رسالة';
      case 'new_user': return 'مستخدم جديد';
      default: return type;
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'booking_approved':
      case 'document_verified':
      case 'car_approved':
        return { bg: '#d4edda', color: '#155724' };
      case 'booking_rejected':
      case 'document_rejected':
      case 'car_rejected':
        return { bg: '#f8d7da', color: '#721c24' };
      case 'booking_completed':
        return { bg: '#cce5ff', color: '#004085' };
      case 'booking_cancelled':
        return { bg: '#e2e3e5', color: '#383d41' };
      case 'message_reply':
        return { bg: '#fff3cd', color: '#856404' };
      case 'new_user':
        return { bg: '#d1ecf1', color: '#0c5460' };
      default:
        return { bg: '#e2e3e5', color: '#383d41' };
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

  const handleMarkAsRead = (id) => {
    onMarkAsRead(id);
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
      onDelete(id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (window.confirm('هل أنت متأكد من تحديد جميع الإشعارات كمقروءة؟')) {
      filteredNotifications.forEach(notif => {
        if (!notif.read) {
          onMarkAsRead(notif._id);
        }
      });
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع الإشعارات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      filteredNotifications.forEach(notif => {
        onDelete(notif._id);
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔔 نظام الإشعارات</h2>
        <p style={styles.subtitle}>
          إجمالي الإشعارات: {notifications.length} | 
          غير مقروءة: <span style={{color: '#dc3545', fontWeight: 'bold'}}>{unreadCount}</span>
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
            <option value="all">جميع الإشعارات</option>
            <option value="unread">غير مقروءة ({unreadCount})</option>
            <option value="read">مقروءة</option>
          </select>
        </div>

        <div style={styles.searchGroup}>
          <input
            type="text"
            placeholder="🔍 بحث في الإشعارات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.actionButtons}>
          <button 
            onClick={handleMarkAllAsRead}
            style={styles.markAllButton}
            disabled={unreadCount === 0}
            title="تحديد الكل كمقروء"
          >
            ✓ تحديد الكل
          </button>
          <button 
            onClick={handleDeleteAll}
            style={styles.deleteAllButton}
            disabled={filteredNotifications.length === 0}
            title="حذف الكل"
          >
            🗑️ حذف الكل
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div style={styles.statsCards}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{notifications.length}</span>
          <span style={styles.statLabel}>إجمالي الإشعارات</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{unreadCount}</span>
          <span style={styles.statLabel}>غير مقروءة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{notifications.filter(n => n.read).length}</span>
          <span style={styles.statLabel}>مقروءة</span>
        </div>
      </div>

      {/* قائمة الإشعارات */}
      <div style={styles.notificationsList}>
        {filteredNotifications.length === 0 ? (
          <div style={styles.noResults}>
            <p>لا توجد إشعارات تطابق البحث</p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const typeStyle = getNotificationColor(notification.type);
            
            return (
              <div 
                key={notification._id} 
                style={{
                  ...styles.notificationCard,
                  backgroundColor: notification.read ? 'white' : '#f0f7ff',
                  borderRight: notification.read ? 'none' : '4px solid #007bff'
                }}
              >
                <div style={styles.notificationHeader}>
                  <div style={styles.notificationType}>
                    <span style={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <span style={{
                      ...styles.typeBadge,
                      backgroundColor: typeStyle.bg,
                      color: typeStyle.color,
                    }}>
                      {getNotificationTypeText(notification.type)}
                    </span>
                  </div>
                  <span style={styles.notificationTime}>
                    {formatDate(notification.createdAt)}
                  </span>
                </div>

                <div style={styles.notificationContent}>
                  <h4 style={styles.notificationTitle}>{notification.title}</h4>
                  <p style={styles.notificationMessage}>{notification.message}</p>
                  
                  {notification.userId && (
                    <div style={styles.userInfo}>
                      <small>للمستخدم: {notification.userId.name || notification.userId.email}</small>
                    </div>
                  )}
                  
                  {notification.relatedId && (
                    <div style={styles.relatedInfo}>
                      <small>معرف ذو صلة: {notification.relatedId}</small>
                    </div>
                  )}
                </div>

                <div style={styles.notificationFooter}>
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification._id)}
                      style={styles.readButton}
                      title="تحديد كمقروء"
                    >
                      ✓ تحديد كمقروء
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(notification._id)}
                    style={styles.deleteButton}
                    title="حذف الإشعار"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
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
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  markAllButton: {
    padding: '8px 12px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    ':disabled': {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
    },
  },
  deleteAllButton: {
    padding: '8px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    ':disabled': {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
    },
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
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  notificationCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    transition: 'box-shadow 0.3s',
    ':hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  notificationType: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  notificationIcon: {
    fontSize: '20px',
  },
  typeBadge: {
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  notificationTime: {
    fontSize: '12px',
    color: '#999',
  },
  notificationContent: {
    marginBottom: '15px',
  },
  notificationTitle: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    color: '#333',
  },
  notificationMessage: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
  },
  userInfo: {
    marginTop: '5px',
    color: '#888',
    fontSize: '12px',
  },
  relatedInfo: {
    marginTop: '5px',
    color: '#888',
    fontSize: '11px',
  },
  notificationFooter: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    borderTop: '1px solid #eee',
    paddingTop: '10px',
  },
  readButton: {
    padding: '5px 10px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '5px 10px',
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
};

export default NotificationsTab;