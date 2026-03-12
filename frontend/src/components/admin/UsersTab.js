import React, { useState } from 'react';

const UsersTab = ({ users, onUpdateRole, onToggleStatus, onDelete }) => {
  const [filter, setFilter] = useState('all'); // all, verified, pending, rejected, active, suspended
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  if (!users || users.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>👥</span>
        <h3 style={styles.emptyTitle}>لا يوجد مستخدمين</h3>
        <p style={styles.emptyText}>لم يتم تسجيل أي مستخدمين بعد</p>
      </div>
    );
  }

  // تصفية المستخدمين
  const filteredUsers = users.filter(user => {
    // تصفية حسب الحالة
    if (filter === 'verified' && user.verificationStatus !== 'approved') return false;
    if (filter === 'pending' && user.verificationStatus !== 'pending') return false;
    if (filter === 'rejected' && user.verificationStatus !== 'rejected') return false;
    if (filter === 'active' && user.status !== 'active') return false;
    if (filter === 'suspended' && user.status !== 'suspended') return false;
    
    // تصفية حسب البحث
    if (searchTerm) {
      const name = user.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const phone = user.phone?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return name.includes(term) || email.includes(term) || phone.includes(term);
    }
    
    return true;
  });

  const getRoleText = (role) => {
    switch(role) {
      case 'admin': return 'مشرف';
      case 'company': return 'شركة';
      case 'user': return 'مستخدم';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return { bg: '#cce5ff', color: '#004085' };
      case 'company': return { bg: '#d4edda', color: '#155724' };
      case 'user': return { bg: '#e2e3e5', color: '#383d41' };
      default: return { bg: '#e2e3e5', color: '#383d41' };
    }
  };

  const getVerificationStatus = (status) => {
    switch(status) {
      case 'approved': return { text: 'موثق', color: '#155724', bg: '#d4edda' };
      case 'pending': return { text: 'في انتظار التحقق', color: '#856404', bg: '#fff3cd' };
      case 'rejected': return { text: 'مرفوض', color: '#721c24', bg: '#f8d7da' };
      default: return { text: 'غير موثق', color: '#383d41', bg: '#e2e3e5' };
    }
  };

  const getAccountStatus = (status) => {
    switch(status) {
      case 'active': return { text: 'نشط', color: '#155724', bg: '#d4edda' };
      case 'suspended': return { text: 'موقوف', color: '#856404', bg: '#fff3cd' };
      default: return { text: 'غير معروف', color: '#383d41', bg: '#e2e3e5' };
    }
  };

  const handleRoleChange = (userId, currentRole) => {
    const newRole = prompt('أدخل الدور الجديد (user, company, admin):', currentRole);
    if (newRole && ['user', 'company', 'admin'].includes(newRole)) {
      onUpdateRole(userId, newRole);
    } else if (newRole) {
      alert('دور غير صالح. الأدوار المسموحة: user, company, admin');
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>👥 إدارة المستخدمين</h2>
        <p style={styles.subtitle}>إجمالي المستخدمين: {users.length}</p>
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
            <option value="all">جميع المستخدمين</option>
            <option value="verified">موثقين</option>
            <option value="pending">في انتظار التحقق</option>
            <option value="rejected">مرفوضين</option>
            <option value="active">نشطين</option>
            <option value="suspended">موقوفين</option>
          </select>
        </div>

        <div style={styles.searchGroup}>
          <input
            type="text"
            placeholder="🔍 بحث بالاسم أو البريد أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div style={styles.statsCards}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{users.length}</span>
          <span style={styles.statLabel}>إجمالي المستخدمين</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{users.filter(u => u.verificationStatus === 'approved').length}</span>
          <span style={styles.statLabel}>موثقين</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{users.filter(u => u.verificationStatus === 'pending').length}</span>
          <span style={styles.statLabel}>في انتظار التحقق</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{users.filter(u => u.role === 'company').length}</span>
          <span style={styles.statLabel}>شركات</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{users.filter(u => u.role === 'admin').length}</span>
          <span style={styles.statLabel}>مشرفين</span>
        </div>
      </div>

      {/* جدول المستخدمين */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>معلومات الاتصال</th>
              <th>الدور</th>
              <th>حالة التحقق</th>
              <th>حالة الحساب</th>
              <th>تاريخ التسجيل</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const roleStyle = getRoleColor(user.role);
              const verificationStatus = getVerificationStatus(user.verificationStatus);
              const accountStatus = getAccountStatus(user.status);
              
              return (
                <tr key={user._id}>
                  <td>
                    <div style={styles.userCell}>
                      <div style={styles.userAvatar}>
                        {user.name?.charAt(0) || 'م'}
                      </div>
                      <div>
                        <strong>{user.name || 'غير معروف'}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={styles.contactCell}>
                      <div><span style={styles.contactIcon}>📧</span> {user.email || '-'}</div>
                      <div><span style={styles.contactIcon}>📞</span> {user.phone || '-'}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      ...styles.roleBadge,
                      backgroundColor: roleStyle.bg,
                      color: roleStyle.color,
                    }}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: verificationStatus.bg,
                      color: verificationStatus.color,
                    }}>
                      {verificationStatus.text}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: accountStatus.bg,
                      color: accountStatus.color,
                    }}>
                      {accountStatus.text}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('ar-TN')}</td>
                  <td>
                    <div style={styles.actionButtons}>
                      <button 
                        onClick={() => handleViewDetails(user)}
                        style={styles.viewButton}
                        title="عرض التفاصيل"
                      >
                        👁️
                      </button>
                      <button 
                        onClick={() => handleRoleChange(user._id, user.role)}
                        style={styles.roleButton}
                        title="تغيير الدور"
                      >
                        🔄
                      </button>
                      <button 
                        onClick={() => onToggleStatus(user._id, user.status)}
                        style={{
                          ...styles.statusButton,
                          backgroundColor: user.status === 'active' ? '#ffc107' : '#28a745',
                        }}
                        title={user.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                      >
                        {user.status === 'active' ? '🔒' : '🔓'}
                      </button>
                      <button 
                        onClick={() => onDelete(user._id)}
                        style={styles.deleteButton}
                        title="حذف المستخدم"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal عرض تفاصيل المستخدم */}
      {showUserModal && selectedUser && (
        <div style={styles.modal} onClick={() => setShowUserModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>تفاصيل المستخدم</h3>
              <button 
                onClick={() => setShowUserModal(false)}
                style={styles.modalCloseButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.userDetailHeader}>
                <div style={styles.userDetailAvatar}>
                  {selectedUser.name?.charAt(0) || 'م'}
                </div>
                <div>
                  <h4 style={styles.userDetailName}>{selectedUser.name}</h4>
                  <p style={styles.userDetailRole}>{getRoleText(selectedUser.role)}</p>
                </div>
              </div>

              <div style={styles.userDetailInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>البريد الإلكتروني:</span>
                  <span style={styles.infoValue}>{selectedUser.email}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>رقم الهاتف:</span>
                  <span style={styles.infoValue}>{selectedUser.phone || 'غير مضاف'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>تاريخ التسجيل:</span>
                  <span style={styles.infoValue}>
                    {new Date(selectedUser.createdAt).toLocaleDateString('ar-TN')}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>آخر تحديث:</span>
                  <span style={styles.infoValue}>
                    {new Date(selectedUser.updatedAt).toLocaleDateString('ar-TN')}
                  </span>
                </div>
              </div>

              <div style={styles.userDetailStatus}>
                <div style={styles.statusRow}>
                  <span style={styles.statusLabel}>حالة التحقق:</span>
                  <span style={{
                    ...styles.statusValue,
                    ...getVerificationStatus(selectedUser.verificationStatus)
                  }}>
                    {getVerificationStatus(selectedUser.verificationStatus).text}
                  </span>
                </div>
                <div style={styles.statusRow}>
                  <span style={styles.statusLabel}>حالة الحساب:</span>
                  <span style={{
                    ...styles.statusValue,
                    ...getAccountStatus(selectedUser.status)
                  }}>
                    {getAccountStatus(selectedUser.status).text}
                  </span>
                </div>
                <div style={styles.statusRow}>
                  <span style={styles.statusLabel}>الدور:</span>
                  <span style={{
                    ...styles.statusValue,
                    ...getRoleColor(selectedUser.role)
                  }}>
                    {getRoleText(selectedUser.role)}
                  </span>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button 
                  onClick={() => {
                    setShowUserModal(false);
                    handleRoleChange(selectedUser._id, selectedUser.role);
                  }}
                  style={styles.modalRoleButton}
                >
                  🔄 تغيير الدور
                </button>
                <button 
                  onClick={() => {
                    setShowUserModal(false);
                    onToggleStatus(selectedUser._id, selectedUser.status);
                  }}
                  style={{
                    ...styles.modalStatusButton,
                    backgroundColor: selectedUser.status === 'active' ? '#ffc107' : '#28a745',
                  }}
                >
                  {selectedUser.status === 'active' ? '🔒 تعطيل الحساب' : '🔓 تفعيل الحساب'}
                </button>
                <button 
                  onClick={() => {
                    setShowUserModal(false);
                    onDelete(selectedUser._id);
                  }}
                  style={styles.modalDeleteButton}
                >
                  🗑️ حذف المستخدم
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
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
  },
  userAvatar: {
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
  contactCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  contactIcon: {
    marginLeft: '5px',
    fontSize: '14px',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
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
  roleButton: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#17a2b8',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  statusButton: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  deleteButton: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
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
  userDetailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
  },
  userDetailAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '600',
  },
  userDetailName: {
    margin: '0 0 5px 0',
    fontSize: '20px',
    color: '#333',
  },
  userDetailRole: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  userDetailInfo: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '15px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#555',
  },
  infoValue: {
    color: '#333',
  },
  userDetailStatus: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    alignItems: 'center',
  },
  statusLabel: {
    fontWeight: '600',
    color: '#555',
  },
  statusValue: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  modalActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  modalRoleButton: {
    padding: '10px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  modalStatusButton: {
    padding: '10px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  modalDeleteButton: {
    padding: '10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default UsersTab;