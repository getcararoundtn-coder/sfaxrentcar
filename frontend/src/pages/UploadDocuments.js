import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';

const UploadDocuments = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [files, setFiles] = useState({
    idFront: null,
    idBack: null,
    driverLicense: null
  });
  const [previews, setPreviews] = useState({
    idFront: null,
    idBack: null,
    driverLicense: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // التحقق من حالة المستخدم عند تحميل الصفحة
  useEffect(() => {
    if (user?.verificationStatus === 'approved') {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // التحقق من حجم الملف (5 ميجابايت كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      setError(`الملف كبير جداً (أقصى حجم 5 ميجابايت). حجم الملف الحالي: ${(file.size / (1024 * 1024)).toFixed(2)} ميجابايت`);
      return;
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('الرجاء اختيار صورة أو ملف PDF فقط');
      return;
    }

    setError(''); // مسح أي أخطاء سابقة
    setFiles({ ...files, [field]: file });

    // إنشاء معاينة للصور فقط
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      // إذا كان PDF، نعرض أيقونة
      setPreviews({ ...previews, [field]: 'pdf' });
    }
  };

  const handleSubmit = async () => {
    // التحقق من رفع جميع الملفات
    if (!files.idFront || !files.idBack || !files.driverLicense) {
      setError('الرجاء رفع جميع الصور المطلوبة');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('idFront', files.idFront);
    formData.append('idBack', files.idBack);
    formData.append('driverLicense', files.driverLicense);

    try {
      // استخدام fetch بدلاً من Axios لضمان إرسال الكوكيز
      const response = await fetch(`${process.env.REACT_APP_API_URL}/documents/upload`, {
        method: 'POST',
        credentials: 'include', // ⚠️ مهم جداً: يرسل الكوكيز تلقائياً
        body: formData
      });

      // محاكاة تقدم الرفع (لأن fetch لا يدعم onUploadProgress)
      setUploadProgress(50);
      
      const data = await response.json();
      setUploadProgress(100);

      if (data.success) {
        setSuccess('✅ تم رفع المستندات بنجاح! في انتظار مراجعة الإدارة.');
        
        // تحديث حالة المستخدم في السياق
        if (user) {
          setUser({ ...user, verificationStatus: 'pending' });
        }
        
        // التأخير قبل التوجيه
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } else {
        setError(data.message || 'فشل رفع المستندات');
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      if (err.message === 'Failed to fetch') {
        setError('لا يمكن الاتصال بالخادم. تأكد من اتصالك بالإنترنت.');
      } else {
        setError('حدث خطأ في إرسال الطلب: ' + err.message);
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (field) => {
    if (previews[field] === 'pdf') {
      return '📄 PDF';
    }
    return null;
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>رفع وثائق التحقق</h1>
          <p style={styles.subtitle}>يرجى رفع الصور التالية (صيغ JPG, PNG, PDF - أقصى حجم 5 ميجابايت):</p>
          
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div style={styles.progressContainer}>
              <div style={{...styles.progressBar, width: `${uploadProgress}%`}}>
                {uploadProgress}%
              </div>
            </div>
          )}

          <div style={styles.docField}>
            <label style={styles.label}>بطاقة التعريف (الوجه الأمامي) *</label>
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={(e) => handleFileChange(e, 'idFront')}
              disabled={loading}
              style={styles.fileInput}
            />
            {previews.idFront && previews.idFront !== 'pdf' && (
              <div style={styles.previewContainer}>
                <img src={previews.idFront} alt="idFront" style={styles.preview} />
                <button 
                  onClick={() => {
                    setFiles({...files, idFront: null});
                    setPreviews({...previews, idFront: null});
                  }}
                  style={styles.removeButton}
                >
                  ❌ إزالة
                </button>
              </div>
            )}
            {getFileIcon('idFront') && (
              <div style={styles.pdfPreview}>
                <span>📄 ملف PDF تم اختياره</span>
                <button 
                  onClick={() => {
                    setFiles({...files, idFront: null});
                    setPreviews({...previews, idFront: null});
                  }}
                  style={styles.removeButton}
                >
                  ❌ إزالة
                </button>
              </div>
            )}
          </div>

          <div style={styles.docField}>
            <label style={styles.label}>بطاقة التعريف (الوجه الخلفي) *</label>
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={(e) => handleFileChange(e, 'idBack')}
              disabled={loading}
              style={styles.fileInput}
            />
            {previews.idBack && previews.idBack !== 'pdf' && (
              <div style={styles.previewContainer}>
                <img src={previews.idBack} alt="idBack" style={styles.preview} />
                <button 
                  onClick={() => {
                    setFiles({...files, idBack: null});
                    setPreviews({...previews, idBack: null});
                  }}
                  style={styles.removeButton}
                >
                  ❌ إزالة
                </button>
              </div>
            )}
            {getFileIcon('idBack') && (
              <div style={styles.pdfPreview}>
                <span>📄 ملف PDF تم اختياره</span>
                <button 
                  onClick={() => {
                    setFiles({...files, idBack: null});
                    setPreviews({...previews, idBack: null});
                  }}
                  style={styles.removeButton}
                >
                  ❌ إزالة
                </button>
              </div>
            )}
          </div>

          <div style={styles.docField}>
            <label style={styles.label}>رخصة القيادة *</label>
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={(e) => handleFileChange(e, 'driverLicense')}
              disabled={loading}
              style={styles.fileInput}
            />
            {previews.driverLicense && previews.driverLicense !== 'pdf' && (
              <div style={styles.previewContainer}>
                <img src={previews.driverLicense} alt="driverLicense" style={styles.preview} />
                <button 
                  onClick={() => {
                    setFiles({...files, driverLicense: null});
                    setPreviews({...previews, driverLicense: null});
                  }}
                  style={styles.removeButton}
                >
                  ❌ إزالة
                </button>
              </div>
            )}
            {getFileIcon('driverLicense') && (
              <div style={styles.pdfPreview}>
                <span>📄 ملف PDF تم اختياره</span>
                <button 
                  onClick={() => {
                    setFiles({...files, driverLicense: null});
                    setPreviews({...previews, driverLicense: null});
                  }}
                  style={styles.removeButton}
                >
                  ❌ إزالة
                </button>
              </div>
            )}
          </div>

          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>📌 ملاحظات مهمة:</h4>
            <ul style={styles.infoList}>
              <li>يجب أن تكون جميع المستندات سارية المفعول.</li>
              <li>تأكد من وضوح الصور وعدم وجود انعكاسات.</li>
              <li>الوثائق المرفوعة تخضع للمراجعة من قبل الإدارة.</li>
              <li>سيتم إشعارك عند اكتمال المراجعة.</li>
            </ul>
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading || !files.idFront || !files.idBack || !files.driverLicense}
            style={{
              ...styles.button,
              backgroundColor: (loading || !files.idFront || !files.idBack || !files.driverLicense) ? '#6c757d' : '#28a745',
              cursor: (loading || !files.idFront || !files.idBack || !files.driverLicense) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'جاري الرفع...' : 'إرسال للمراجعة'}
          </button>

          <button 
            onClick={() => navigate('/profile')}
            style={styles.cancelButton}
          >
            العودة للملف الشخصي
          </button>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 60px)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
    fontSize: '28px',
    fontWeight: 'bold'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
    fontSize: '14px'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb'
  },
  progressContainer: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    marginBottom: '20px',
    height: '20px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007bff',
    color: 'white',
    textAlign: 'center',
    fontSize: '12px',
    lineHeight: '20px',
    transition: 'width 0.3s ease'
  },
  docField: {
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px'
  },
  fileInput: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    fontSize: '14px',
    cursor: 'pointer'
  },
  previewContainer: {
    marginTop: '10px',
    position: 'relative',
    display: 'inline-block'
  },
  preview: {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #ddd',
    padding: '5px'
  },
  pdfPreview: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#fff3cd',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  removeButton: {
    marginTop: '5px',
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #b8daff'
  },
  infoTitle: {
    margin: '0 0 10px 0',
    color: '#004085',
    fontSize: '16px'
  },
  infoList: {
    margin: '0',
    paddingRight: '20px',
    color: '#004085',
    fontSize: '14px',
    lineHeight: '1.8'
  },
  button: {
    width: '100%',
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '10px'
  },
  cancelButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

export default UploadDocuments;