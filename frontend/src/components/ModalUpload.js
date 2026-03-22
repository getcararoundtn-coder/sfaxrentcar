import React, { useState, useContext } from 'react';
import Modal from './Modal';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { showSuccess, showError } from '../utils/ToastConfig';

const ModalUpload = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(AuthContext);
  const [driverLicenseFile, setDriverLicenseFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(`الملف كبير جداً (أقصى حجم 5 ميجابايت)`);
      return;
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('الرجاء اختيار صورة أو ملف PDF فقط');
      return;
    }

    setError('');
    setDriverLicenseFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview('pdf');
    }
  };

  const handleSubmit = async () => {
    if (!driverLicenseFile) {
      setError('الرجاء رفع رخصة القيادة');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('driverLicense', driverLicenseFile);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('✅ تم رفع رخصة القيادة بنجاح!');
        if (user) setUser({ ...user, verificationStatus: 'pending' });
        onClose();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.message || 'فشل رفع رخصة القيادة');
        showError(data.message || 'فشل رفع رخصة القيادة');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('حدث خطأ في الاتصال');
      showError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="توثيق الحساب" size="small">
      <div className="modal-upload">
        <p className="upload-subtitle">
          يرجى رفع صورة رخصة القيادة (JPG, PNG, PDF - أقصى حجم 5 ميجابايت)
        </p>
        
        {error && <div className="modal-error">{error}</div>}
        
        <div className="upload-area">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            disabled={loading}
            className="upload-input"
          />
          {preview && preview !== 'pdf' && (
            <div className="upload-preview">
              <img src={preview} alt="preview" />
              <button 
                onClick={() => { setDriverLicenseFile(null); setPreview(null); }}
                className="remove-preview"
              >
                ✕
              </button>
            </div>
          )}
          {preview === 'pdf' && (
            <div className="upload-preview pdf">
              <span>📄 PDF</span>
              <button 
                onClick={() => { setDriverLicenseFile(null); setPreview(null); }}
                className="remove-preview"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={loading || !driverLicenseFile}
          className="upload-submit"
        >
          {loading ? 'جاري الرفع...' : 'Envoyer pour vérification'}
        </button>
      </div>
    </Modal>
  );
};

export default ModalUpload;