import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const AddCar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    licensePlate: '',
    pricePerDay: '',
    deposit: '',
    location: '',
    city: '',
    delegation: '',
    fuelType: 'petrol',
    transmission: 'manual',
    seats: '',
    doors: '',
    mileage: '',
    features: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [insuranceFrontFile, setInsuranceFrontFile] = useState(null);
  const [insuranceBackFile, setInsuranceBackFile] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    // ✅ تم إزالة التحقق من التوثيق - المالك لا يحتاج توثيقاً لإضافة سيارة
    // ✅ فقط نتحقق من أن المستخدم مسجل دخول
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // التأكد من أن جميع الحقول الإجبارية لها قيم
    const finalData = {
      ...formData,
      city: formData.city || 'Sfax',
      delegation: formData.delegation || 'Sfax Ville',
      doors: formData.doors || 4,
      mileage: formData.mileage || 0
    };

    const data = new FormData();
    Object.keys(finalData).forEach(key => {
      if (finalData[key] !== undefined && finalData[key] !== '') {
        data.append(key, finalData[key]);
      }
    });
    
    imageFiles.forEach(file => {
      data.append('images', file);
    });
    
    if (insuranceFrontFile) data.append('insuranceFront', insuranceFrontFile);
    if (insuranceBackFile) data.append('insuranceBack', insuranceBackFile);

    try {
      const response = await API.post('/cars', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      
      if (response.data.success) {
        alert('✅ تم إضافة السيارة بنجاح، في انتظار موافقة المشرف');
        navigate('/');
      }
    } catch (err) {
      console.error('Error adding car:', err);
      
      if (err.response?.status === 401) {
        alert('❌ انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى');
        navigate('/login');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || 'الرجاء تعبئة جميع الحقول المطلوبة';
        alert(`❌ فشل إضافة السيارة: ${errorMessage}`);
      } else {
        alert(err.response?.data?.message || 'فشل إضافة السيارة');
      }
    } finally {
      setLoading(false);
    }
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
      marginBottom: '30px', 
      color: '#333', 
      fontSize: '28px', 
      fontWeight: 'bold' 
    },
    contractSection: {
      backgroundColor: '#e7f3ff',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '30px',
      border: '1px solid #b8daff'
    },
    contractTitle: {
      margin: '0 0 10px 0',
      color: '#004085',
      fontSize: '18px'
    },
    contractText: {
      marginBottom: '15px',
      color: '#004085',
      lineHeight: '1.6'
    },
    downloadButton: {
      display: 'inline-block',
      padding: '12px 20px',
      backgroundColor: '#28a745',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '15px'
    },
    contractNote: {
      backgroundColor: '#fff3cd',
      padding: '15px',
      borderRadius: '4px',
      border: '1px solid #ffeeba',
      color: '#856404'
    },
    noteList: {
      margin: '10px 0 0 0',
      paddingRight: '20px'
    },
    formGroup: { marginBottom: '20px' },
    input: { 
      width: '100%', 
      padding: '10px', 
      borderRadius: '4px', 
      border: '1px solid #ddd', 
      fontSize: '16px' 
    },
    previewContainer: { 
      display: 'flex', 
      gap: '10px', 
      marginTop: '10px', 
      flexWrap: 'wrap' 
    },
    preview: { 
      width: '100px', 
      height: '100px', 
      objectFit: 'cover', 
      borderRadius: '4px', 
      border: '1px solid #ddd' 
    },
    button: { 
      width: '100%', 
      padding: '14px', 
      backgroundColor: '#28a745', 
      color: 'white', 
      border: 'none', 
      borderRadius: '4px', 
      fontSize: '16px', 
      fontWeight: 'bold', 
      cursor: 'pointer',
      marginTop: '10px'
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>إضافة سيارة جديدة</h1>
          
          {user?.role !== 'company' && (
            <div style={styles.contractSection}>
              <h3 style={styles.contractTitle}>📄 عقد الكراء - مهم للمالكين الأفراد</h3>
              <p style={styles.contractText}>
                بصفتك مالكاً فردياً، يجب أن يكون لديك عقد كراء ورقي لتوقيعه مع المستأجر يوم تسليم السيارة. 
                يمكنك تحميل نموذج العقد من الرابط أدناه، وتعبئته وطباعته:
              </p>
              <a 
                href="/contracts/contrat_modele.pdf" 
                download="contrat_modele.pdf"
                style={styles.downloadButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                📥 تحميل نموذج العقد (PDF)
              </a>
              <div style={styles.contractNote}>
                <strong>ملاحظة:</strong> هذا العقد نموذجي ويمكنك تعديله حسب الاتفاق مع المستأجر. يجب أن يتضمن:
                <ul style={styles.noteList}>
                  <li>بيانات المالك والمستأجر كاملة</li>
                  <li>بيانات السيارة (الماركة، الموديل، رقم اللوحة)</li>
                  <li>فترة الكراء (تاريخ البداية والنهاية)</li>
                  <li>السعر الإجمالي ومبلغ الضمان</li>
                  <li>بنود المسؤولية والتأمين</li>
                  <li>توقيع الطرفين</li>
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label>الماركة *</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>الموديل *</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>السنة *</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>رقم اللوحة *</label>
              <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>السعر اليومي (دينار) *</label>
              <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>مبلغ الضمان (دينار) *</label>
              <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>الموقع *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>الولاية *</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>المعتمدية *</label>
              <input type="text" name="delegation" value={formData.delegation} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>نوع الوقود *</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} style={styles.input}>
                <option value="petrol">بنزين</option>
                <option value="diesel">ديزل</option>
                <option value="electric">كهرباء</option>
                <option value="hybrid">هايبرد</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>ناقل الحركة *</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} style={styles.input}>
                <option value="manual">يدوي</option>
                <option value="automatic">أوتوماتيك</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>عدد المقاعد *</label>
              <input type="number" name="seats" value={formData.seats} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>عدد الأبواب *</label>
              <input type="number" name="doors" value={formData.doors} onChange={handleChange} required min="2" max="6" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>الكيلومترات *</label>
              <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>المعدات (مفصولة بفواصل)</label>
              <input type="text" name="features" placeholder="مثال: GPS, Bluetooth, Climatisation" value={formData.features} onChange={handleChange} style={styles.input} />
            </div>
            
            <div style={styles.formGroup}>
              <label>صور السيارة (يمكن اختيار عدة صور)</label>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={styles.input} />
              {previewImages.length > 0 && (
                <div style={styles.previewContainer}>
                  {previewImages.map((src, idx) => (
                    <img key={idx} src={src} alt={`preview-${idx}`} style={styles.preview} />
                  ))}
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label>صورة التأمين (الوجه الأمامي)</label>
              <input type="file" accept="image/*" onChange={(e) => setInsuranceFrontFile(e.target.files[0])} style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label>صورة التأمين (الوجه الخلفي)</label>
              <input type="file" accept="image/*" onChange={(e) => setInsuranceBackFile(e.target.files[0])} style={styles.input} />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'جاري الإضافة...' : 'إضافة سيارة'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddCar;