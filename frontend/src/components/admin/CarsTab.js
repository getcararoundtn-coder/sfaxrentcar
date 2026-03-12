import React, { useState } from 'react';

const CarsTab = ({ 
  pendingCars = [], 
  allCars = [], 
  onApprove, 
  onReject, 
  onEdit, 
  onDelete 
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCarModal, setShowCarModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    brand: '',
    model: '',
    year: '',
    pricePerDay: '',
    location: '',
    fuelType: '',
    seats: '',
  });

  // دمج السيارات
  const allCarsList = [...new Map([...pendingCars, ...allCars].map(car => [car._id, car])).values()];

  // تصفية السيارات
  const filteredCars = allCarsList.filter(car => {
    if (filter !== 'all' && car.status !== filter) return false;
    
    if (searchTerm) {
      const brand = car.brand?.toLowerCase() || '';
      const model = car.model?.toLowerCase() || '';
      const ownerName = car.ownerId?.name?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return brand.includes(term) || model.includes(term) || ownerName.includes(term);
    }
    
    return true;
  });

  const handleViewCar = (car) => {
    setSelectedCar(car);
    setEditMode(false);
    setShowCarModal(true);
  };

  const handleEditCar = (car) => {
    setSelectedCar(car);
    setEditFormData({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      pricePerDay: car.pricePerDay || '',
      location: car.location || '',
      fuelType: car.fuelType || '',
      seats: car.seats || '',
    });
    setEditMode(true);
    setShowCarModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    onEdit(selectedCar._id, editFormData);
    setShowCarModal(false);
    setEditMode(false);
  };

  const handleDelete = (carId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه السيارة؟')) {
      onDelete(carId);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return { text: 'موافق عليها', color: '#155724', bg: '#d4edda' };
      case 'pending':
        return { text: 'في انتظار الموافقة', color: '#856404', bg: '#fff3cd' };
      case 'rejected':
        return { text: 'مرفوضة', color: '#721c24', bg: '#f8d7da' };
      default:
        return { text: status, color: '#383d41', bg: '#e2e3e5' };
    }
  };

  const getFuelTypeText = (fuel) => {
    switch(fuel) {
      case 'petrol': return 'بنزين';
      case 'diesel': return 'ديزل';
      case 'electric': return 'كهرباء';
      case 'hybrid': return 'هايبرد';
      default: return fuel;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🚗 إدارة السيارات</h2>
        <p style={styles.subtitle}>إجمالي السيارات: {allCarsList.length}</p>
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
            <option value="all">جميع السيارات</option>
            <option value="pending">في انتظار الموافقة ({pendingCars.length})</option>
            <option value="approved">موافق عليها</option>
            <option value="rejected">مرفوضة</option>
          </select>
        </div>

        <div style={styles.searchGroup}>
          <input
            type="text"
            placeholder="🔍 بحث باسم السيارة أو المالك..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div style={styles.statsCards}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{allCarsList.length}</span>
          <span style={styles.statLabel}>إجمالي السيارات</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{pendingCars.length}</span>
          <span style={styles.statLabel}>في انتظار الموافقة</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{allCarsList.filter(c => c.status === 'approved').length}</span>
          <span style={styles.statLabel}>موافق عليها</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{allCarsList.filter(c => c.status === 'rejected').length}</span>
          <span style={styles.statLabel}>مرفوضة</span>
        </div>
      </div>

      {/* جدول السيارات */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>السيارة</th>
              <th>المالك</th>
              <th>السعر/اليوم</th>
              <th>الموقع</th>
              <th>الحالة</th>
              <th>تاريخ الإضافة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredCars.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.noData}>لا توجد سيارات تطابق البحث</td>
              </tr>
            ) : (
              filteredCars.map(car => {
                const status = getStatusBadge(car.status);
                return (
                  <tr key={car._id}>
                    <td>
                      <div style={styles.carCell}>
                        {car.images && car.images.length > 0 ? (
                          <img 
                            src={car.images[0]} 
                            alt={`${car.brand} ${car.model}`} 
                            style={styles.carThumb}
                          />
                        ) : (
                          <div style={styles.carThumbPlaceholder}>🚗</div>
                        )}
                        <div>
                          <strong>{car.brand} {car.model} ({car.year})</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{car.ownerId?.name || 'غير معروف'}</div>
                      <small style={styles.ownerEmail}>{car.ownerId?.email || ''}</small>
                    </td>
                    <td style={styles.priceCell}>{car.pricePerDay} د.ت</td>
                    <td>{car.location}</td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: status.bg,
                        color: status.color,
                      }}>
                        {status.text}
                      </span>
                    </td>
                    <td>{new Date(car.createdAt).toLocaleDateString('ar-TN')}</td>
                    <td>
                      <div style={styles.actionButtons}>
                        <button 
                          onClick={() => handleViewCar(car)}
                          style={styles.viewButton}
                          title="عرض التفاصيل"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => handleEditCar(car)}
                          style={styles.editButton}
                          title="تعديل"
                        >
                          ✏️
                        </button>
                        {car.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => onApprove(car._id)}
                              style={styles.approveButton}
                              title="موافقة"
                            >
                              ✅
                            </button>
                            <button 
                              onClick={() => onReject(car._id)}
                              style={styles.rejectButton}
                              title="رفض"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDelete(car._id)}
                          style={styles.deleteButton}
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal عرض/تعديل السيارة */}
      {showCarModal && selectedCar && (
        <div style={styles.modal} onClick={() => setShowCarModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editMode ? 'تعديل بيانات السيارة' : 'تفاصيل السيارة'}
              </h3>
              <button 
                onClick={() => setShowCarModal(false)}
                style={styles.modalCloseButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {!editMode ? (
                // عرض التفاصيل
                <>
                  <div style={styles.carImages}>
                    {selectedCar.images && selectedCar.images.length > 0 ? (
                      selectedCar.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`car-${idx}`} style={styles.modalImage} />
                      ))
                    ) : (
                      <div style={styles.noImage}>لا توجد صور</div>
                    )}
                  </div>

                  <div style={styles.carDetails}>
                    <h4>{selectedCar.brand} {selectedCar.model} ({selectedCar.year})</h4>
                    
                    <div style={styles.detailRow}>
                      <strong>المالك:</strong> {selectedCar.ownerId?.name || 'غير معروف'}
                    </div>
                    <div style={styles.detailRow}>
                      <strong>البريد:</strong> {selectedCar.ownerId?.email || 'غير معروف'}
                    </div>
                    <div style={styles.detailRow}>
                      <strong>الهاتف:</strong> {selectedCar.ownerId?.phone || 'غير معروف'}
                    </div>
                    
                    <div style={styles.detailGrid}>
                      <div><strong>السعر اليومي:</strong> {selectedCar.pricePerDay} د.ت</div>
                      <div><strong>الموقع:</strong> {selectedCar.location}</div>
                      <div><strong>نوع الوقود:</strong> {getFuelTypeText(selectedCar.fuelType)}</div>
                      <div><strong>عدد المقاعد:</strong> {selectedCar.seats}</div>
                    </div>

                    {selectedCar.insuranceFront && (
                      <div style={styles.detailRow}>
                        <strong>صورة التأمين (أمامي):</strong>{' '}
                        <a href={selectedCar.insuranceFront} target="_blank" rel="noopener noreferrer">عرض</a>
                      </div>
                    )}
                    {selectedCar.insuranceBack && (
                      <div style={styles.detailRow}>
                        <strong>صورة التأمين (خلفي):</strong>{' '}
                        <a href={selectedCar.insuranceBack} target="_blank" rel="noopener noreferrer">عرض</a>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // نموذج التعديل
                <div style={styles.editForm}>
                  <div style={styles.formGroup}>
                    <label>الماركة</label>
                    <input
                      type="text"
                      name="brand"
                      value={editFormData.brand}
                      onChange={handleEditChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>الموديل</label>
                    <input
                      type="text"
                      name="model"
                      value={editFormData.model}
                      onChange={handleEditChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>السنة</label>
                    <input
                      type="number"
                      name="year"
                      value={editFormData.year}
                      onChange={handleEditChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>السعر اليومي (دينار)</label>
                    <input
                      type="number"
                      name="pricePerDay"
                      value={editFormData.pricePerDay}
                      onChange={handleEditChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>الموقع</label>
                    <input
                      type="text"
                      name="location"
                      value={editFormData.location}
                      onChange={handleEditChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>نوع الوقود</label>
                    <select
                      name="fuelType"
                      value={editFormData.fuelType}
                      onChange={handleEditChange}
                      style={styles.input}
                    >
                      <option value="petrol">بنزين</option>
                      <option value="diesel">ديزل</option>
                      <option value="electric">كهرباء</option>
                      <option value="hybrid">هايبرد</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label>عدد المقاعد</label>
                    <input
                      type="number"
                      name="seats"
                      value={editFormData.seats}
                      onChange={handleEditChange}
                      style={styles.input}
                    />
                  </div>
                </div>
              )}

              <div style={styles.modalFooter}>
                {editMode ? (
                  <>
                    <button onClick={handleSaveEdit} style={styles.saveButton}>حفظ التعديلات</button>
                    <button onClick={() => setEditMode(false)} style={styles.cancelButton}>إلغاء</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditCar(selectedCar)} style={styles.editButtonLarge}>✏️ تعديل</button>
                    {selectedCar.status === 'pending' && (
                      <>
                        <button onClick={() => onApprove(selectedCar._id)} style={styles.approveButtonLarge}>✅ موافقة</button>
                        <button onClick={() => onReject(selectedCar._id)} style={styles.rejectButtonLarge}>❌ رفض</button>
                      </>
                    )}
                    <button onClick={() => handleDelete(selectedCar._id)} style={styles.deleteButtonLarge}>🗑️ حذف</button>
                  </>
                )}
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
  carCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
  },
  carThumb: {
    width: '60px',
    height: '40px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  carThumbPlaceholder: {
    width: '60px',
    height: '40px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    borderRadius: '4px',
  },
  ownerEmail: {
    color: '#666',
    fontSize: '12px',
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
  editButton: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#ffc107',
    color: '#333',
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
  deleteButton: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#6c757d',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
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
  carImages: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    marginBottom: '20px',
  },
  modalImage: {
    width: '150px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  noImage: {
    width: '100%',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
  },
  carDetails: {
    marginBottom: '20px',
  },
  detailRow: {
    marginBottom: '10px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '10px',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  modalFooter: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    justifyContent: 'flex-end',
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editButtonLarge: {
    padding: '8px 16px',
    backgroundColor: '#ffc107',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
  deleteButtonLarge: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default CarsTab;