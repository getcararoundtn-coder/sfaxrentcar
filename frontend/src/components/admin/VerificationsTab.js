import React, { useState } from 'react';

const VerificationsTab = ({ verifications, onApprove, onReject }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  if (!verifications || verifications.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>✅</span>
        <h3 style={styles.emptyTitle}>لا توجد طلبات تحقق</h3>
        <p style={styles.emptyText}>جميع طلبات التحقق تمت معالجتها</p>
      </div>
    );
  }

  const handleApprove = (userId) => {
    if (window.confirm('هل أنت متأكد من قبول هذا المستخدم؟')) {
      onApprove(userId);
    }
  };

  const handleRejectClick = (userId) => {
    setSelectedUserId(userId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (rejectReason.trim()) {
      onReject(selectedUserId, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedUserId(null);
    } else {
      alert('الرجاء إدخال سبب الرفض');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>✅ طلبات التحقق من الهوية</h2>
      <p style={styles.subtitle}>يوجد {verifications.length} طلب في انتظار المراجعة</p>

      <div style={styles.grid}>
        {verifications.map((doc) => (
          <div key={doc._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.userName}>{doc.userId?.name || 'غير معروف'}</h3>
              <span style={styles.pendingBadge}>في انتظار المراجعة</span>
            </div>

            <div style={styles.userInfo}>
              <p><strong>البريد الإلكتروني:</strong> {doc.userId?.email || 'غير موجود'}</p>
              <p><strong>رقم الهاتف:</strong> {doc.userId?.phone || 'غير موجود'}</p>
              <p><strong>تاريخ الطلب:</strong> {new Date(doc.createdAt).toLocaleDateString('ar-TN')}</p>
            </div>

            <div style={styles.documentsSection}>
              <h4 style={styles.documentsTitle}>الوثائق المرفوعة:</h4>
              <div style={styles.documentsGrid}>
                {doc.idFront && (
                  <div style={styles.documentItem}>
                    <span style={styles.documentIcon}>🪪</span>
                    <span>الوجه الأمامي للبطاقة</span>
                    <button 
                      onClick={() => setSelectedDoc(doc.idFront)}
                      style={styles.viewButton}
                    >
                      عرض
                    </button>
                  </div>
                )}
                {doc.idBack && (
                  <div style={styles.documentItem}>
                    <span style={styles.documentIcon}>🪪</span>
                    <span>الوجه الخلفي للبطاقة</span>
                    <button 
                      onClick={() => setSelectedDoc(doc.idBack)}
                      style={styles.viewButton}
                    >
                      عرض
                    </button>
                  </div>
                )}
                {doc.driverLicense && (
                  <div style={styles.documentItem}>
                    <span style={styles.documentIcon}>🚗</span>
                    <span>رخصة القيادة</span>
                    <button 
                      onClick={() => setSelectedDoc(doc.driverLicense)}
                      style={styles.viewButton}
                    >
                      عرض
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.actions}>
              <button 
                onClick={() => handleApprove(doc.userId._id)}
                style={styles.approveButton}
              >
                ✅ قبول
              </button>
              <button 
                onClick={() => handleRejectClick(doc.userId._id)}
                style={styles.rejectButton}
              >
                ❌ رفض
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal عرض الصور */}
      {selectedDoc && (
        <div style={styles.modal} onClick={() => setSelectedDoc(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedDoc(null)}
              style={styles.closeButton}
            >
              ✕
            </button>
            {selectedDoc.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img src={selectedDoc} alt="Document" style={styles.modalImage} />
            ) : (
              <iframe src={selectedDoc} style={styles.modalIframe} title="Document" />
            )}
          </div>
        </div>
      )}

      {/* Modal سبب الرفض */}
      {showRejectModal && (
        <div style={styles.modal} onClick={() => setShowRejectModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>سبب الرفض</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="اكتب سبب رفض طلب التحقق..."
              rows="4"
              style={styles.textarea}
              autoFocus
            />
            <div style={styles.modalActions}>
              <button 
                onClick={handleRejectConfirm}
                style={styles.confirmButton}
              >
                تأكيد الرفض
              </button>
              <button 
                onClick={() => setShowRejectModal(false)}
                style={styles.cancelButton}
              >
                إلغاء
              </button>
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
  title: {
    marginTop: 0,
    marginBottom: '10px',
    color: '#333',
    fontSize: '24px',
  },
  subtitle: {
    marginBottom: '20px',
    color: '#666',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  },
  cardHeader: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
  },
  pendingBadge: {
    padding: '4px 8px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  userInfo: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
  },
  documentsSection: {
    padding: '15px',
  },
  documentsTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#666',
  },
  documentsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  documentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  documentIcon: {
    fontSize: '20px',
  },
  viewButton: {
    marginLeft: 'auto',
    padding: '4px 8px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  actions: {
    padding: '15px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: '10px',
  },
  approveButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  rejectButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
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
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    maxWidth: '90%',
    maxHeight: '90%',
    overflow: 'auto',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    zIndex: 1001,
  },
  modalImage: {
    maxWidth: '100%',
    maxHeight: '80vh',
    display: 'block',
  },
  modalIframe: {
    width: '800px',
    height: '600px',
    border: 'none',
  },
  modalTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    color: '#333',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    marginBottom: '15px',
    resize: 'vertical',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
  },
  confirmButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default VerificationsTab;