import React, { useState } from 'react';

const DocumentsTab = ({ documents, onApprove, onReject, onDelete }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  if (!documents || documents.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>📄</span>
        <h3 style={styles.emptyTitle}>لا توجد وثائق</h3>
        <p style={styles.emptyText}>لم يتم رفع أي وثائق بعد</p>
      </div>
    );
  }

  const filteredDocuments = documents.filter(doc => {
    if (filter !== 'all' && doc.status !== filter) return false;
    if (searchTerm) {
      const userName = doc.userId?.name?.toLowerCase() || '';
      const userEmail = doc.userId?.email?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return userName.includes(term) || userEmail.includes(term);
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { text: 'في انتظار المراجعة', color: '#856404', bg: '#fff3cd' };
      case 'approved':
        return { text: 'مقبول', color: '#155724', bg: '#d4edda' };
      case 'rejected':
        return { text: 'مرفوض', color: '#721c24', bg: '#f8d7da' };
      default:
        return { text: status, color: '#333', bg: '#e2e3e5' };
    }
  };

  const getDocumentTypeIcon = (docType) => {
    switch(docType) {
      case 'idFront': return '🪪';
      case 'idBack': return '🪪';
      case 'driverLicense': return '🚗';
      default: return '📄';
    }
  };

  const getDocumentTypeName = (docType) => {
    switch(docType) {
      case 'idFront': return 'بطاقة تعريف - أمامي';
      case 'idBack': return 'بطاقة تعريف - خلفي';
      case 'driverLicense': return 'رخصة قيادة';
      default: return docType;
    }
  };

  const handleApprove = (docId) => {
    if (window.confirm('هل أنت متأكد من قبول هذه الوثيقة؟')) {
      onApprove(docId);
    }
  };

  const handleReject = (docId) => {
    const reason = prompt('الرجاء إدخال سبب الرفض:');
    if (reason) {
      onReject(docId, reason);
    }
  };

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (docToDelete) {
      onDelete(docToDelete._id);
      setShowDeleteConfirm(false);
      setDocToDelete(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📄 إدارة الوثائق</h2>
        <p style={styles.subtitle}>إجمالي الوثائق: {documents.length}</p>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>تصفية حسب الحالة:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">جميع الوثائق</option>
            <option value="pending">في انتظار المراجعة</option>
            <option value="approved">مقبولة</option>
            <option value="rejected">مرفوضة</option>
          </select>
        </div>

        <div style={styles.searchGroup}>
          <input
            type="text"
            placeholder="🔍 بحث باسم المستخدم أو البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.statsCards}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{documents.filter(d => d.status === 'pending').length}</span>
          <span style={styles.statLabel}>في انتظار المراجعة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{documents.filter(d => d.status === 'approved').length}</span>
          <span style={styles.statLabel}>مقبولة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{documents.filter(d => d.status === 'rejected').length}</span>
          <span style={styles.statLabel}>مرفوضة</span>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>نوع الوثيقة</th>
              <th>تاريخ الرفع</th>
              <th>الحالة</th>
              <th>عرض</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.noData}>لا توجد وثائق تطابق البحث</td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => {
                const status = getStatusBadge(doc.status);
                
                const documentEntries = [
                  { type: 'idFront', url: doc.idFront },
                  { type: 'idBack', url: doc.idBack },
                  { type: 'driverLicense', url: doc.driverLicense }
                ].filter(item => item.url);

                return documentEntries.map((item, index) => (
                  <tr key={`${doc._id}-${item.type}`}>
                    <td>
                      <div style={styles.userCell}>
                        <strong>{doc.userId?.name || 'غير معروف'}</strong>
                        <span style={styles.userEmail}>{doc.userId?.email || ''}</span>
                      </div>
                    </td>
                    <td>
                      <div style={styles.docTypeCell}>
                        <span style={styles.docIcon}>{getDocumentTypeIcon(item.type)}</span>
                        <span>{getDocumentTypeName(item.type)}</span>
                      </div>
                    </td>
                    <td>{new Date(doc.createdAt).toLocaleDateString('ar-TN')}</td>
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
                      <button 
                        onClick={() => setSelectedDoc(item.url)}
                        style={styles.viewButton}
                      >
                        👁️ عرض
                      </button>
                    </td>
                    <td>
                      <div style={styles.actionButtons}>
                        {doc.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(doc._id)}
                              style={styles.approveButton}
                              title="قبول"
                            >
                              ✅ قبول
                            </button>
                            <button 
                              onClick={() => handleReject(doc._id)}
                              style={styles.rejectButton}
                              title="رفض"
                            >
                              ❌ رفض
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteClick(doc)}
                          style={styles.deleteButton}
                          title="مسح الوثائق"
                        >
                          🗑️ مسح
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة تأكيد المسح */}
      {showDeleteConfirm && docToDelete && (
        <div style={styles.modal} onClick={() => setShowDeleteConfirm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>⚠️ تأكيد مسح الوثائق</h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                style={styles.modalCloseButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.warningIcon}>⚠️</div>
              <p style={styles.warningText}>
                هل أنت متأكد من مسح وثائق المستخدم <strong>{docToDelete.userId?.name}</strong>؟
              </p>
              <p style={styles.warningSubtext}>
                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع وثائق هذا المستخدم نهائياً.
              </p>

              <div style={styles.documentsSummary}>
                <h4 style={styles.documentsSummaryTitle}>الوثائق التي سيتم مسحها:</h4>
                <ul style={styles.documentsSummaryList}>
                  {docToDelete.idFront && <li style={styles.documentsSummaryItem}>🪪 الوجه الأمامي للبطاقة</li>}
                  {docToDelete.idBack && <li style={styles.documentsSummaryItem}>🪪 الوجه الخلفي للبطاقة</li>}
                  {docToDelete.driverLicense && <li style={styles.documentsSummaryItem}>🚗 رخصة القيادة</li>}
                </ul>
              </div>

              <div style={styles.modalActions}>
                <button 
                  onClick={handleDeleteConfirm}
                  style={styles.confirmDeleteButton}
                >
                  ✅ نعم، قم بالمسح
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  style={styles.cancelButton}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة عرض الوثائق */}
      {selectedDoc && (
        <div style={styles.modal} onClick={() => setSelectedDoc(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedDoc(null)}
              style={styles.closeButton}
            >
              ✕
            </button>
            <h3 style={styles.modalTitle}>عرض الوثيقة</h3>
            <div style={styles.modalBody}>
              {selectedDoc.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img 
                  src={selectedDoc} 
                  alt="Document" 
                  style={styles.modalImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/document-placeholder.png';
                  }}
                />
              ) : selectedDoc.match(/\.pdf$/i) ? (
                <iframe 
                  src={selectedDoc} 
                  style={styles.modalIframe} 
                  title="Document PDF"
                />
              ) : (
                <div style={styles.modalPlaceholder}>
                  <span style={styles.placeholderIcon}>📄</span>
                  <p>لا يمكن عرض هذا النوع من الملفات</p>
                  <a 
                    href={selectedDoc} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.downloadLink}
                  >
                    تحميل الملف
                  </a>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <a 
                href={selectedDoc} 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.downloadButton}
              >
                📥 تحميل الملف
              </a>
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
  userCell: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
  },
  userEmail: {
    fontSize: '12px',
    color: '#666',
    marginTop: '2px',
  },
  docTypeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  docIcon: {
    fontSize: '18px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  viewButton: {
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  actionButtons: {
    display: 'flex',
    gap: '5px',
  },
  approveButton: {
    padding: '5px 10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  rejectButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  noData: {
    textAlign: 'center',
    padding: '20px',
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
  warningIcon: {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '15px',
    color: '#dc3545',
  },
  warningText: {
    fontSize: '16px',
    color: '#333',
    textAlign: 'center',
    marginBottom: '10px',
  },
  warningSubtext: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '20px',
  },
  documentsSummary: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  documentsSummaryTitle: {
    margin: '0 0 10px 0',
    color: '#333',
  },
  documentsSummaryList: {
    margin: 0,
    paddingRight: '20px',
    color: '#555',
  },
  documentsSummaryItem: {
    marginBottom: '5px',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
  },
  confirmDeleteButton: {
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
    maxHeight: '70vh',
    objectFit: 'contain',
  },
  modalIframe: {
    width: '800px',
    height: '600px',
    border: 'none',
  },
  modalPlaceholder: {
    textAlign: 'center',
    padding: '40px',
  },
  placeholderIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '20px',
  },
  downloadLink: {
    display: 'inline-block',
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
  },
  modalFooter: {
    padding: '15px',
    borderTop: '1px solid #ddd',
    textAlign: 'center',
  },
  downloadButton: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
  },
};

export default DocumentsTab;