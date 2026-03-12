import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import './NotificationBell.css';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastNotificationId, setLastNotificationId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.data);
      if (data.data.length > 0) setLastNotificationId(data.data[0]._id);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications/unread-count');
      setUnreadCount(data.data);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  const fetchNewNotifications = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications');
      const newNotifications = data.data;
      if (newNotifications.length > 0) {
        const latestNotification = newNotifications[0];
        if (latestNotification._id !== lastNotificationId) {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Audio play failed:', e));
          toast.custom((t) => (
            <div className={`notification-toast ${t.visible ? 'show' : ''}`}>
              <div className="notification-toast-icon">🔔</div>
              <div className="notification-toast-content">
                <h4>{latestNotification.title}</h4>
                <p>{latestNotification.message}</p>
              </div>
            </div>
          ), { duration: 5000, position: 'top-center' });
          setNotifications(newNotifications);
          setLastNotificationId(latestNotification._id);
          fetchUnreadCount();
        }
      }
    } catch (err) {
      console.error('Error fetching new notifications:', err);
    }
  }, [lastNotificationId, fetchUnreadCount]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    fetchUnreadCount();
    const interval = setInterval(fetchNewNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications, fetchUnreadCount, fetchNewNotifications]);

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch('/notifications/mark-all-read');
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'booking_approved': return '✅';
      case 'booking_rejected': return '❌';
      case 'booking_completed': return '✔️';
      case 'booking_cancelled': return '✖️';
      case 'booking_pending': return '⏳';
      case 'document_verified': return '📄✅';
      case 'document_rejected': return '📄❌';
      case 'car_approved': return '🚗✅';
      case 'car_rejected': return '🚗❌';
      case 'message_reply': return '💬';
      case 'new_review': return '⭐';
      case 'new_user': return '👤';
      default: return '🔔';
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

  if (!user) return null;

  return (
    <div className="notification-bell-container">
      <button className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>الإشعارات</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">تحديد الكل كمقروء</button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">لا توجد إشعارات</p>
            ) : (
              notifications.slice(0, 5).map(notif => (
                <div key={notif._id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => markAsRead(notif._id)}>
                  <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                  <div className="notification-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <small>{formatDate(notif.createdAt)}</small>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="notification-footer">
            <Link to="/notifications" onClick={() => setShowDropdown(false)}>عرض كل الإشعارات</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;