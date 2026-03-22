import { useState, useEffect, useContext } from 'react';
import Navbar from '../components/layout/Navbar';
import NotificationBell from '../components/NotificationBell';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';

// استيراد جميع التبويبات
import StatsTab from '../components/admin/StatsTab';
import VerificationsTab from '../components/admin/VerificationsTab';
import UsersTab from '../components/admin/UsersTab';
import CarsTab from '../components/admin/CarsTab';
import BookingsTab from '../components/admin/BookingsTab';
import DocumentsTab from '../components/admin/DocumentsTab';
import MessagesTab from '../components/admin/MessagesTab';
import SettingsTab from '../components/admin/SettingsTab';
import NotificationsTab from '../components/admin/NotificationsTab';
import ReportsTab from '../components/admin/ReportsTab';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  
  // حالات البيانات
  const [stats, setStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingCars, setPendingCars] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState(null);

  // جلب جميع البيانات
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching admin dashboard data...');
      
      const [
        statsRes,
        verificationsRes,
        usersRes,
        pendingCarsRes,
        allCarsRes,
        pendingBookingsRes,
        allBookingsRes,
        documentsRes,
        messagesRes,
        settingsRes,
        notificationsRes
      ] = await Promise.all([
        API.get('/admin/stats/advanced').catch(err => {
          console.error('Stats error:', err);
          return { data: { data: null } };
        }),
        API.get('/admin/verifications/pending').catch(err => {
          console.error('Verifications error:', err);
          return { data: { data: [] } };
        }),
        API.get('/admin/users').catch(err => {
          console.error('Users error:', err);
          return { data: { data: [] } };
        }),
        API.get('/admin/cars/pending').catch(err => {
          console.error('Pending cars error:', err);
          return { data: { data: [] } };
        }),
        API.get('/admin/cars/all').catch(err => {
          console.error('All cars error:', err);
          return { data: { data: [] } };
        }),
        API.get('/admin/bookings/pending').catch(err => {
          console.error('Pending bookings error:', err);
          return { data: { data: [] } };
        }),
        API.get('/admin/bookings/all').catch(err => {
          console.error('All bookings error:', err);
          return { data: { data: [] } };
        }),
        API.get('/admin/documents').catch(err => {
          console.error('Documents error:', err);
          return { data: { data: [] } };
        }),
        API.get('/admin/messages').catch(err => {
          console.error('Messages error:', err);
          return { data: { data: [] } };
        }),
        API.get('/settings').catch(err => {
          console.error('Settings error:', err);
          return { data: { data: null } };
        }),
        API.get('/notifications').catch(err => {
          console.error('Notifications error:', err);
          return { data: { data: [] } };
        })
      ]);

      setStats(statsRes.data.data);
      setPendingVerifications(verificationsRes.data.data || []);
      setUsers(usersRes.data.data || []);
      setPendingCars(pendingCarsRes.data.data || []);
      setAllCars(allCarsRes.data.data || []);
      setPendingBookings(pendingBookingsRes.data.data || []);
      setAllBookings(allBookingsRes.data.data || []);
      setDocuments(documentsRes.data.data || []);
      setMessages(messagesRes.data.data || []);
      setSettings(settingsRes.data.data);
      setNotifications(notificationsRes.data.data || []);

      console.log('✅ Admin dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Error fetching admin data:', err);
      showError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // ==================== دوال التحقق ====================
  const handleApproveVerification = async (userId) => {
    try {
      await API.patch(`/admin/verifications/${userId}/approve`);
      showSuccess('✅ تم قبول التحقق');
      fetchAllData();
    } catch (err) {
      showError('❌ فشلت الموافقة');
    }
  };

  const handleRejectVerification = async (userId, reason) => {
    try {
      await API.patch(`/admin/verifications/${userId}/reject`, { reason });
      showSuccess('✅ تم رفض التحقق');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل الرفض');
    }
  };

  // ==================== دوال المستخدمين ====================
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await API.patch(`/admin/users/${userId}/role`, { role: newRole });
      showSuccess('✅ تم تحديث دور المستخدم');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل تحديث الدور');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await API.patch(`/admin/users/${userId}/status`, { 
        status: currentStatus === 'active' ? 'suspended' : 'active' 
      });
      showSuccess(`✅ تم ${currentStatus === 'active' ? 'تعطيل' : 'تفعيل'} المستخدم`);
      fetchAllData();
    } catch (err) {
      showError('❌ فشل تغيير حالة المستخدم');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      showSuccess('✅ تم حذف المستخدم');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل الحذف');
    }
  };

  // ==================== دوال السيارات ====================
  const handleApproveCar = async (carId) => {
    try {
      await API.patch(`/admin/cars/${carId}/approve`);
      showSuccess('✅ تمت الموافقة على السيارة');
      fetchAllData();
    } catch (err) {
      showError('❌ فشلت الموافقة');
    }
  };

  const handleRejectCar = async (carId) => {
    try {
      await API.patch(`/admin/cars/${carId}/reject`);
      showSuccess('✅ تم رفض السيارة');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل الرفض');
    }
  };

  const handleEditCar = async (carId, updatedData) => {
    try {
      await API.put(`/admin/cars/${carId}`, updatedData);
      showSuccess('✅ تم تعديل السيارة');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل تعديل السيارة');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذه السيارة؟')) return;
    try {
      await API.delete(`/admin/cars/${carId}`);
      showSuccess('✅ تم حذف السيارة');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل الحذف');
    }
  };

  // ✅ دالة تفعيل/إلغاء تمييز السيارة
  const handleToggleFeatured = async (carId, isFeatured, durationDays = 7) => {
    try {
      const response = await API.patch(`/admin/cars/${carId}/featured`, {
        isFeatured,
        durationDays: durationDays || 7
      });
      if (response.data.success) {
        showSuccess(response.data.message || '✅ تم تحديث حالة التميز');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error toggling featured:', err);
      showError('❌ فشل تحديث حالة التميز');
    }
  };

  // ==================== دوال الحجوزات ====================
  const handleApproveBooking = async (bookingId) => {
    try {
      await API.patch(`/admin/bookings/${bookingId}/status`, { status: 'approved' });
      showSuccess('✅ تمت الموافقة على الحجز');
      fetchAllData();
    } catch (err) {
      showError('❌ فشلت الموافقة');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await API.patch(`/admin/bookings/${bookingId}/status`, { status: 'rejected' });
      showSuccess('✅ تم رفض الحجز');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل الرفض');
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await API.patch(`/admin/bookings/${bookingId}/status`, { status: 'completed' });
      showSuccess('✅ تم تأكيد اكتمال الحجز');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل تأكيد الاكتمال');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من إلغاء هذا الحجز؟')) return;
    try {
      await API.patch(`/admin/bookings/${bookingId}/status`, { status: 'cancelled' });
      showSuccess('✅ تم إلغاء الحجز');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل الإلغاء');
    }
  };

  // ==================== دوال الوثائق ====================
  const handleApproveDocument = async (docId) => {
    try {
      await API.patch(`/admin/documents/${docId}/approve`);
      showSuccess('✅ تمت الموافقة على الوثيقة');
      fetchAllData();
    } catch (err) {
      showError('❌ فشلت الموافقة');
    }
  };

  const handleRejectDocument = async (docId) => {
    try {
      await API.patch(`/admin/documents/${docId}/reject`);
      showSuccess('✅ تم رفض الوثيقة');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل الرفض');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من مسح هذه الوثيقة؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    try {
      await API.delete(`/admin/documents/${docId}`);
      showSuccess('✅ تم مسح الوثيقة بنجاح');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل مسح الوثيقة');
    }
  };

  // ==================== دوال الرسائل ====================
  const handleReplyToMessage = async (messageId, replyText) => {
    try {
      await API.post(`/admin/messages/${messageId}/reply`, { reply: replyText });
      showSuccess('✅ تم إرسال الرد');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل إرسال الرد');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try {
      await API.delete(`/admin/messages/${messageId}`);
      showSuccess('✅ تم حذف الرسالة');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل الحذف');
    }
  };

  // ==================== دوال الإعدادات ====================
  const handleSaveSettings = async (updatedSettings) => {
    try {
      await API.put('/settings', updatedSettings);
      showSuccess('✅ تم حفظ الإعدادات بنجاح');
      fetchAllData();
    } catch (err) {
      showError('❌ فشل حفظ الإعدادات');
    }
  };

  // ==================== دوال الإشعارات ====================
  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await API.patch(`/notifications/${notificationId}/read`);
      fetchAllData();
    } catch (err) {
      console.error('Error marking notification as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      fetchAllData();
    } catch (err) {
      console.error('Error deleting notification');
    }
  };

  // ==================== دوال التقارير ====================
  const handleGenerateReport = async (reportType, dateRange) => {
    try {
      const { data } = await API.post('/admin/reports/generate', { type: reportType, ...dateRange });
      setReports(data.data);
      showSuccess('✅ تم إنشاء التقرير');
    } catch (err) {
      showError('❌ فشل إنشاء التقرير');
    }
  };

  // حساب عدد الإشعارات غير المقروءة
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // تعريف التبويبات
  const tabs = [
    { id: 'stats', label: '📊 الإحصائيات', count: null },
    { id: 'verifications', label: '✅ طلبات التحقق', count: pendingVerifications.length },
    { id: 'users', label: '👥 المستخدمين', count: users.length },
    { id: 'cars', label: '🚗 السيارات المعلقة', count: pendingCars.length },
    { id: 'bookings', label: '📅 الحجوزات المعلقة', count: pendingBookings.length },
    { id: 'documents', label: '📄 الوثائق', count: documents.length },
    { id: 'messages', label: '💬 الرسائل', count: messages.length },
    { id: 'settings', label: '⚙️ الإعدادات', count: null },
    { id: 'notifications', label: '🔔 الإشعارات', count: unreadNotifications },
    { id: 'reports', label: '📈 التقارير', count: null },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>جاري تحميل لوحة التحكم...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>لوحة تحكم المشرف</h1>
            <p style={styles.welcome}>
              مرحباً {user?.name} | 
              آخر تحديث: {new Date().toLocaleTimeString('ar-TN')}
            </p>
          </div>
          <div style={styles.headerActions}>
            <NotificationBell />
            <button onClick={fetchAllData} style={styles.refreshButton}>
              🔄 تحديث
            </button>
          </div>
        </div>

        {/* شريط التبويبات */}
        <div style={styles.tabsContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                backgroundColor: activeTab === tab.id ? '#007bff' : '#f8f9fa',
                color: activeTab === tab.id ? 'white' : '#333',
                borderBottom: activeTab === tab.id ? '3px solid #0056b3' : 'none'
              }}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* محتوى التبويبات */}
        <div style={styles.tabContent}>
          {activeTab === 'stats' && <StatsTab stats={stats} />}
          
          {activeTab === 'verifications' && (
            <VerificationsTab 
              verifications={pendingVerifications}
              onApprove={handleApproveVerification}
              onReject={handleRejectVerification}
            />
          )}
          
          {activeTab === 'users' && (
            <UsersTab 
              users={users}
              onUpdateRole={handleUpdateUserRole}
              onToggleStatus={handleToggleUserStatus}
              onDelete={handleDeleteUser}
            />
          )}
          
          {activeTab === 'cars' && (
            <CarsTab 
              pendingCars={pendingCars}
              allCars={allCars}
              onApprove={handleApproveCar}
              onReject={handleRejectCar}
              onEdit={handleEditCar}
              onDelete={handleDeleteCar}
              onToggleFeatured={handleToggleFeatured}
            />
          )}
          
          {activeTab === 'bookings' && (
            <BookingsTab 
              pendingBookings={pendingBookings}
              allBookings={allBookings}
              onApprove={handleApproveBooking}
              onReject={handleRejectBooking}
              onComplete={handleCompleteBooking}
              onCancel={handleCancelBooking}
            />
          )}
          
          {activeTab === 'documents' && (
            <DocumentsTab 
              documents={documents}
              onApprove={handleApproveDocument}
              onReject={handleRejectDocument}
              onDelete={handleDeleteDocument}
            />
          )}
          
          {activeTab === 'messages' && (
            <MessagesTab 
              messages={messages}
              onReply={handleReplyToMessage}
              onDelete={handleDeleteMessage}
            />
          )}
          
          {activeTab === 'settings' && (
            <SettingsTab 
              settings={settings}
              onSave={handleSaveSettings}
            />
          )}
          
          {activeTab === 'notifications' && (
            <NotificationsTab 
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onDelete={handleDeleteNotification}
            />
          )}
          
          {activeTab === 'reports' && (
            <ReportsTab 
              reports={reports}
              onGenerate={handleGenerateReport}
            />
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: 'calc(100vh - 60px)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '24px'
  },
  welcome: {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '14px'
  },
  refreshButton: {
    padding: '10px 20px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  },
  tabsContainer: {
    display: 'flex',
    gap: '5px',
    marginBottom: '20px',
    overflowX: 'auto',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s',
    flex: '0 1 auto'
  },
  tabContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    minHeight: '500px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 60px)',
    backgroundColor: '#f8f9fa'
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  loadingText: {
    color: '#666',
    fontSize: '16px'
  }
};

// إضافة animation للـ loading spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;