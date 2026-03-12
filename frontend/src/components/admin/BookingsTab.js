import React, { useState } from 'react';

const BookingsTab = ({ 
  pendingBookings = [], 
  allBookings = [], 
  onApprove, 
  onReject, 
  onComplete, 
  onCancel 
}) => {
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, completed, cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // دمج جميع الحجوزات
  const allBookingsList = [...new Map([...pendingBookings, ...allBookings].map(b => [b._id, b])).values()];

  // تصفية الحجوزات
  const filteredBookings = allBookingsList.filter(booking => {
    if (filter !== 'all' && booking.status !== filter) return false;
    
    if (searchTerm) {
      const carName = `${booking.carId?.brand || ''} ${booking.carId?.model || ''}`.toLowerCase();
      const renterName = booking.renterId?.name?.toLowerCase() || '';
      const ownerName = booking.carId?.ownerId?.name?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return carName.includes(term) || renterName.includes(term) || ownerName.includes(term);
    }
    
    return true;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { text: 'في انتظار الموافقة', color: '#856404', bg: '#fff3cd' };
      case 'approved':
        return { text: 'مؤكد', color: '#155724', bg: '#d4edda' };
      case 'rejected':
        return { text: 'مرفوض', color: '#721c24', bg: '#f8d7da' };
      case 'completed':
        return { text: 'مكتمل', color: '#004085', bg: '#cce5ff' };
      case 'cancelled':
        return { text: 'ملغي', color: '#383d41', bg: '#e2e3e5' };
      default:
        return { text: status, color: '#383d41', bg: '#e2e3e5' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-TN');
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate - startDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📅 إدارة الحجوزات</h2>
        <p style={styles.subtitle}>إجمالي الحجوزات: {allBookingsList.length}</p>
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
            <option value="all">جميع الحجوزات</option>
            <option value="pending">في انتظار الموافقة ({pendingBookings.length})</option>
            <option value="approved">مؤكدة</option>
            <option value="rejected">مرفوضة</option>
            <option value="completed">مكتملة</option>
            <option value="cancelled">ملغية</option>
          </select>
        </div>

        <div style={styles.searchGroup}>
          <input
            type="text"
            placeholder="🔍 بحث باسم السيارة أو المستأجر أو المالك..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div style={styles.statsCards}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{allBookingsList.length}</span>
          <span style={styles.statLabel}>إجمالي الحجوزات</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{pendingBookings.length}</span>
          <span style={styles.statLabel}>في انتظار الموافقة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{allBookingsList.filter(b => b.status === 'approved').length}</span>
          <span style={styles.statLabel}>مؤكدة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{allBookingsList.filter(b => b.status === 'completed').length}</span>
          <span style={styles.statLabel}>مكتملة</span>
        </div>
      </div>

      {/* جدول الحجوزات */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>السيارة</th>
              <th>المستأجر</th>
              <th>المالك</th>
              <th>فترة الحجز</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.noData}>لا توجد حجوزات تطابق البحث</td>
              </tr>
            ) : (
              filteredBookings.map(booking => {
                const status = getStatusBadge(booking.status);
                const days = calculateDays(booking.startDate, booking.endDate);
                
                return (
                  <tr key={booking._id}>
                    <td>
                      <strong>{booking.carId?.brand} {booking.carId?.model}</strong>
                      <br />
                      <small>{booking.carId?.licensePlate}</small>
                    </td>
                    <td>
                      <div>{booking.renterId?.name || 'غير معروف'}</div>
                      <small style={styles.renterEmail}>{booking.renterId?.email}</small>
                    </td>
                    <td>
                      <div>{booking.carId?.ownerId?.name || 'غير معروف'}</div>
                      <small style={styles.ownerEmail}>{booking.carId?.ownerId?.email}</small>
                    </td>
                    <td>
                      <div>{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</div>
                      <small style={styles.duration}>{days} أيام</small>
                    </td>
                    <td style={styles.priceCell}>{booking.totalPrice} د.ت</td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: status.bg,
                        color: status.color,
                      }}>
                        {status.text}
                      </span>
                    </td>
                    <td>
                      <div style={styles.actionButtons}>
                        <button 
                          onClick={() => handleViewBooking(booking)}
                          style={styles.viewButton}
                          title="عرض التفاصيل"
                        >
                          👁️
                        </button>
                        {booking.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => onApprove(booking._id)}
                              style={styles.approveButton}
                              title="موافقة"
                            >
                              ✅
                            </button>
                            <button 
                              onClick={() => onReject(booking._id)}
                              style={styles.rejectButton}
                              title="رفض"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <>
                            <button 
                              onClick={() => onComplete(booking._id)}
                              style={styles.completeButton}
                              title="تأكيد الاكتمال"
                            >
                              ✔️
                            </button>
                            <button 
                              onClick={() => onCancel(booking._id)}
                              style={styles.cancelButton}
                              title="إلغاء"
                            >
                              ✖️
                            </button>
                          </>
                        )}
                        {(booking.status === 'rejected' || booking.status === 'cancelled') && (
                          <span style={styles.disabledAction}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal عرض تفاصيل الحجز */}
      {showBookingModal && selectedBooking && (
        <div style={styles.modal} onClick={() => setShowBookingModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>تفاصيل الحجز</h3>
              <button 
                onClick={() => setShowBookingModal(false)}
                style={styles.modalCloseButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.bookingDetailSection}>
                <h4>معلومات السيارة</h4>
                <p><strong>السيارة:</strong> {selectedBooking.carId?.brand} {selectedBooking.carId?.model} ({selectedBooking.carId?.year})</p>
                <p><strong>رقم اللوحة:</strong> {selectedBooking.carId?.licensePlate}</p>
                <p><strong>الموقع:</strong> {selectedBooking.carId?.location}</p>
                {selectedBooking.carId?.images && selectedBooking.carId.images.length > 0 && (
                  <div style={styles.carImages}>
                    <img src={selectedBooking.carId.images[0]} alt="car" style={styles.carThumbModal} />
                  </div>
                )}
              </div>

              <div style={styles.bookingDetailSection}>
                <h4>المستأجر</h4>
                <p><strong>الاسم:</strong> {selectedBooking.renterId?.name}</p>
                <p><strong>البريد:</strong> {selectedBooking.renterId?.email}</p>
                <p><strong>الهاتف:</strong> {selectedBooking.renterId?.phone}</p>
              </div>

              <div style={styles.bookingDetailSection}>
                <h4>المالك</h4>
                <p><strong>الاسم:</strong> {selectedBooking.carId?.ownerId?.name}</p>
                <p><strong>البريد:</strong> {selectedBooking.carId?.ownerId?.email}</p>
                <p><strong>الهاتف:</strong> {selectedBooking.carId?.ownerId?.phone}</p>
              </div>

              <div style={styles.bookingDetailSection}>
                <h4>تفاصيل الحجز</h4>
                <p><strong>تاريخ البداية:</strong> {new Date(selectedBooking.startDate).toLocaleDateString('ar-TN')}</p>
                <p><strong>تاريخ النهاية:</strong> {new Date(selectedBooking.endDate).toLocaleDateString('ar-TN')}</p>
                <p><strong>المدة:</strong> {calculateDays(selectedBooking.startDate, selectedBooking.endDate)} أيام</p>
                <p><strong>المبلغ الإجمالي:</strong> {selectedBooking.totalPrice} د.ت</p>
                <p><strong>حالة الحجز:</strong> <span style={{...styles.statusBadge, ...getStatusBadge(selectedBooking.status)}}>{getStatusBadge(selectedBooking.status).text}</span></p>
                <p><strong>تاريخ الإنشاء:</strong> {new Date(selectedBooking.createdAt).toLocaleDateString('ar-TN')}</p>
              </div>

              {selectedBooking.contractPdf && (
                <div style={styles.bookingDetailSection}>
                  <h4>العقد</h4>
                  <a href={selectedBooking.contractPdf} target="_blank" rel="noopener noreferrer" style={styles.contractLink}>
                    📄 عرض العقد
                  </a>
                </div>
              )}

              <div style={styles.modalFooter}>
                {selectedBooking.status === 'pending' && (
                  <>
                    <button onClick={() => { onApprove(selectedBooking._id); setShowBookingModal(false); }} style={styles.approveButtonLarge}>✅ موافقة</button>
                    <button onClick={() => { onReject(selectedBooking._id); setShowBookingModal(false); }} style={styles.rejectButtonLarge}>❌ رفض</button>
                  </>
                )}
                {selectedBooking.status === 'approved' && (
                  <>
                    <button onClick={() => { onComplete(selectedBooking._id); setShowBookingModal(false); }} style={styles.completeButtonLarge}>✔️ تأكيد الاكتمال</button>
                    <button onClick={() => { onCancel(selectedBooking._id); setShowBookingModal(false); }} style={styles.cancelButtonLarge}>✖️ إلغاء</button>
                  </>
                )}
                <button onClick={() => setShowBookingModal(false)} style={styles.closeButton}>إغلاق</button>
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
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  renterEmail: {
    color: '#666',
    fontSize: '12px',
  },
  ownerEmail: {
    color: '#666',
    fontSize: '12px',
  },
  duration: {
    color: '#28a745',
    fontSize: '11px',
  },
  priceCell: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  actionButtons: {
    display: 'flex',
    gap: '5px',
    justifyContent: 'center',
  },
  viewButton: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  approveButton: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#28a745',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  rejectButton: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  completeButton: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#17a2b8',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cancelButton: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#6c757d',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  disabledAction: {
    color: '#ccc',
    fontSize: '14px',
  },
  noData: {
    textAlign: 'center',
    padding: '30px',
    color: '#666',
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
    maxWidth: '600px',
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
  bookingDetailSection: {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  },
  carImages: {
    marginTop: '10px',
  },
  carThumbModal: {
    width: '100px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  contractLink: {
    display: 'inline-block',
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
  },
  modalFooter: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    justifyContent: 'flex-end',
  },
  approveButtonLarge: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  rejectButtonLarge: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  completeButtonLarge: {
    padding: '8px 16px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButtonLarge: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  closeButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default BookingsTab;