import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { showSuccess, showError } from '../utils/ToastConfig';
import './Profile.css';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data } = await API.get('/documents/my-docs');
        setDocuments(data.data);
      } catch (err) {
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    try {
      const { data } = await API.put('/users/profile', formData);
      setUser(data.data);
      showSuccess('تم تحديث الملف الشخصي بنجاح');
      setEditMode(false);
    } catch (err) {
      showError(err.response?.data?.message || 'فشل تحديث الملف الشخصي');
    }
  };

  const getVerificationText = (status) => {
    switch(status) {
      case 'approved': return { text: '✅ موثق', color: '#28a745', desc: 'حسابك موثق، يمكنك إضافة سيارات والحجز' };
      case 'pending': return { text: '⏳ قيد المراجعة', color: '#ffc107', desc: 'مستنداتك قيد المراجعة من قبل الإدارة' };
      case 'rejected': return { text: '❌ مرفوض', color: '#dc3545', desc: 'تم رفض مستنداتك، يرجى إعادة رفعها' };
      default: return { text: '📄 غير مرفوع', color: '#6c757d', desc: 'لم تقم برفع المستندات بعد' };
    }
  };

  if (loading) return <><Navbar /><div className="profile-loading">جاري التحميل...</div></>;

  const verif = getVerificationText(user?.verificationStatus);

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <h1 className="profile-title">الملف الشخصي</h1>
          
          {!editMode ? (
            <>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-label">الاسم</span>
                  <span className="profile-info-value">{user?.name}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">البريد الإلكتروني</span>
                  <span className="profile-info-value">{user?.email}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">رقم الهاتف</span>
                  <span className="profile-info-value">{user?.phone || 'غير مضاف'}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">الدور</span>
                  <span className="profile-info-value">
                    {user?.role === 'admin' ? 'مشرف' : user?.role === 'company' ? 'شركة' : 'مستخدم'}
                  </span>
                </div>
              </div>

              <div className="profile-verification-box" style={{ backgroundColor: verif.color + '20', borderColor: verif.color }}>
                <div className="profile-verification-status" style={{ color: verif.color }}>
                  {verif.text}
                </div>
                <p className="profile-verification-desc">{verif.desc}</p>
              </div>

              <button onClick={() => setEditMode(true)} className="profile-edit-button">
                ✏️ تعديل الملف الشخصي
              </button>

              {user?.verificationStatus !== 'approved' && (
                <Link to="/upload-docs" className="profile-verify-button">
                  {user?.verificationStatus === 'rejected' ? 'إعادة رفع المستندات' : 'رفع المستندات الآن'}
                </Link>
              )}

              {user?.verificationStatus === 'approved' && (
                <div className="profile-actions">
                  <Link to="/add-car" className="profile-action-button">➕ إضافة سيارة</Link>
                  <Link to="/my-bookings" className="profile-action-button">📅 حجوزاتي</Link>
                  <Link to="/owner-cars" className="profile-action-button">🚗 سياراتي</Link>
                </div>
              )}
            </>
          ) : (
            <div className="profile-edit-form">
              <h3 className="profile-edit-title">تعديل الملف الشخصي</h3>
              <div className="profile-input-group">
                <label className="profile-label">الاسم</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="profile-input"
                />
              </div>
              <div className="profile-input-group">
                <label className="profile-label">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="profile-input"
                />
              </div>
              <div className="profile-edit-actions">
                <button onClick={handleUpdateProfile} className="profile-save-button">حفظ</button>
                <button onClick={() => setEditMode(false)} className="profile-cancel-button">إلغاء</button>
              </div>
            </div>
          )}

          {documents && (
            <div className="profile-documents">
              <h3 className="profile-documents-title">الوثائق المرفوعة</h3>
              <div className="profile-images">
                {documents.idFront && (
                  <a href={documents.idFront} target="_blank" rel="noopener noreferrer" className="profile-doc-link">
                    <img src={documents.idFront} alt="idFront" className="profile-thumbnail" />
                    <span>الوجه الأمامي</span>
                  </a>
                )}
                {documents.idBack && (
                  <a href={documents.idBack} target="_blank" rel="noopener noreferrer" className="profile-doc-link">
                    <img src={documents.idBack} alt="idBack" className="profile-thumbnail" />
                    <span>الوجه الخلفي</span>
                  </a>
                )}
                {documents.driverLicense && (
                  <a href={documents.driverLicense} target="_blank" rel="noopener noreferrer" className="profile-doc-link">
                    <img src={documents.driverLicense} alt="driverLicense" className="profile-thumbnail" />
                    <span>رخصة القيادة</span>
                  </a>
                )}
              </div>
              {documents.status === 'pending' && (
                <p className="profile-pending-note">⏳ في انتظار مراجعة الإدارة</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;