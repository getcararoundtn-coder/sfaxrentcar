import React, { useState, useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext'; // استيراد السياق

const SettingsTab = ({ settings, onSave }) => {
  const { fetchSettings } = useContext(SettingsContext); // دالة تحديث الإعدادات في كل الموقع
  const [activeSection, setActiveSection] = useState('general');
  
  // بيانات افتراضية مع التحقق من وجود كل حقل
  const defaultSettings = {
    // معلومات المنصة
    platformName: settings?.platformName || 'SfaxRentCar',
    platformLogo: settings?.platformLogo || '',
    platformFavicon: settings?.platformFavicon || '',
    
    // معلومات الاتصال
    contactEmail: settings?.contactEmail || 'getcararoundtn@gmail.com',
    contactPhone: settings?.contactPhone || '+216 12 345 678',
    contactAddress: settings?.contactAddress || 'صفاقس، تونس',
    
    // التواصل الاجتماعي
    facebook: settings?.facebook || 'https://facebook.com/sfaxrentcar',
    instagram: settings?.instagram || 'https://instagram.com/sfaxrentcar',
    twitter: settings?.twitter || 'https://twitter.com/sfaxrentcar',
    linkedin: settings?.linkedin || 'https://linkedin.com/company/sfaxrentcar',
    
    // العمولات والرسوم
    commissionRate: settings?.commissionRate ?? 10,
    minCommission: settings?.minCommission ?? 5,
    maxCommission: settings?.maxCommission ?? 50,
    
    // إعدادات الحجوزات
    maxBookingDays: settings?.maxBookingDays ?? 30,
    minRenterAge: settings?.minRenterAge ?? 21,
    requireIdVerification: settings?.requireIdVerification ?? true,
    allowCompanyRentals: settings?.allowCompanyRentals ?? true,
    
    // الإشعارات
    emailNotifications: settings?.emailNotifications ?? true,
    smsNotifications: settings?.smsNotifications ?? false,
    adminEmailNotifications: settings?.adminEmailNotifications ?? true,
    
    // نصوص الموقع
    termsAndConditions: settings?.termsAndConditions || 'شروط وأحكام المنصة...',
    privacyPolicy: settings?.privacyPolicy || 'سياسة الخصوصية...',
    aboutUs: settings?.aboutUs || 'منصة SfaxRentCar هي منصة تونسية لكراء السيارات بين الأفراد والشركات...',
    
    // إعدادات الدفع
    paymentMethods: Array.isArray(settings?.paymentMethods) ? settings.paymentMethods : ['card', 'cash'],
    bankName: settings?.bankName || '',
    bankAccountNumber: settings?.bankAccountNumber || '',
    bankIban: settings?.bankIban || '',
    
    // إعدادات متقدمة
    maintenanceMode: settings?.maintenanceMode ?? false,
    allowNewRegistrations: settings?.allowNewRegistrations ?? true,
    requireEmailVerification: settings?.requireEmailVerification ?? true,
  };

  const [formData, setFormData] = useState(defaultSettings);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الملف كبير جداً (أقصى حجم 2 ميجابايت)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result);
        setFormData({ ...formData, platformLogo: reader.result });
      } else if (type === 'favicon') {
        setFaviconPreview(reader.result);
        setFormData({ ...formData, platformFavicon: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentMethodChange = (method) => {
    const current = Array.isArray(formData.paymentMethods) ? [...formData.paymentMethods] : [];
    
    if (current.includes(method)) {
      setFormData({
        ...formData,
        paymentMethods: current.filter(m => m !== method)
      });
    } else {
      setFormData({
        ...formData,
        paymentMethods: [...current, method]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await onSave(formData);
      setSuccess('✅ تم حفظ الإعدادات بنجاح');
      // تحديث الإعدادات في جميع أنحاء الموقع
      await fetchSettings(); // إعادة جلب الإعدادات من الخادم
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('❌ فشل حفظ الإعدادات: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'general', label: 'عام', icon: '🏠' },
    { id: 'contact', label: 'معلومات الاتصال', icon: '📞' },
    { id: 'social', label: 'التواصل الاجتماعي', icon: '🌐' },
    { id: 'fees', label: 'العمولات والرسوم', icon: '💰' },
    { id: 'bookings', label: 'إعدادات الحجوزات', icon: '📅' },
    { id: 'notifications', label: 'الإشعارات', icon: '🔔' },
    { id: 'texts', label: 'نصوص الموقع', icon: '📝' },
    { id: 'payment', label: 'إعدادات الدفع', icon: '💳' },
    { id: 'advanced', label: 'إعدادات متقدمة', icon: '⚙️' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>⚙️ إعدادات الموقع</h2>
        <p style={styles.subtitle}>تخصيص إعدادات المنصة حسب احتياجاتك</p>
      </div>

      {success && <div style={styles.successMessage}>{success}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* شريط التبويبات الجانبية */}
        <div style={styles.mainLayout}>
          <div style={styles.sidebar}>
            {sections.map(section => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                style={{
                  ...styles.sidebarButton,
                  backgroundColor: activeSection === section.id ? '#007bff' : '#f8f9fa',
                  color: activeSection === section.id ? 'white' : '#333',
                }}
              >
                <span style={styles.sidebarIcon}>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>

          <div style={styles.content}>
            {/* القسم العام */}
            {activeSection === 'general' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🏠 معلومات المنصة</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>اسم المنصة</label>
                  <input
                    type="text"
                    name="platformName"
                    value={formData.platformName}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>شعار الموقع</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    style={styles.fileInput}
                  />
                  {logoPreview && (
                    <div style={styles.previewContainer}>
                      <img src={logoPreview} alt="Logo Preview" style={styles.logoPreview} />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setFormData({ ...formData, platformLogo: '' });
                        }}
                        style={styles.removeButton}
                      >
                        إزالة
                      </button>
                    </div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>أيقونة الموقع (Favicon)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'favicon')}
                    style={styles.fileInput}
                  />
                  {faviconPreview && (
                    <div style={styles.previewContainer}>
                      <img src={faviconPreview} alt="Favicon Preview" style={styles.faviconPreview} />
                      <button
                        type="button"
                        onClick={() => {
                          setFaviconPreview(null);
                          setFormData({ ...formData, platformFavicon: '' });
                        }}
                        style={styles.removeButton}
                      >
                        إزالة
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* قسم معلومات الاتصال */}
            {activeSection === 'contact' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📞 معلومات الاتصال</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>البريد الإلكتروني للدعم</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>رقم الهاتف</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>العنوان</label>
                  <textarea
                    name="contactAddress"
                    value={formData.contactAddress}
                    onChange={handleChange}
                    rows="3"
                    style={styles.textarea}
                  />
                </div>
              </div>
            )}

            {/* قسم التواصل الاجتماعي */}
            {activeSection === 'social' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🌐 روابط التواصل الاجتماعي</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>فيسبوك</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>انستغرام</label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>تويتر</label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>لينكد إن</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
              </div>
            )}

            {/* قسم العمولات والرسوم */}
            {activeSection === 'fees' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>💰 العمولات والرسوم</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>نسبة العمولة (%)</label>
                  <input
                    type="number"
                    name="commissionRate"
                    value={formData.commissionRate}
                    onChange={handleNumberChange}
                    min="0"
                    max="100"
                    step="0.5"
                    style={styles.input}
                  />
                  <small style={styles.helpText}>النسبة المئوية التي تحصل عليها المنصة من كل حجز</small>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>أقل عمولة (دينار)</label>
                  <input
                    type="number"
                    name="minCommission"
                    value={formData.minCommission}
                    onChange={handleNumberChange}
                    min="0"
                    style={styles.input}
                  />
                  <small style={styles.helpText}>الحد الأدنى للعمولة</small>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>أكبر عمولة (دينار)</label>
                  <input
                    type="number"
                    name="maxCommission"
                    value={formData.maxCommission}
                    onChange={handleNumberChange}
                    min="0"
                    style={styles.input}
                  />
                  <small style={styles.helpText}>الحد الأقصى للعمولة</small>
                </div>
              </div>
            )}

            {/* قسم إعدادات الحجوزات */}
            {activeSection === 'bookings' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📅 إعدادات الحجوزات</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>الحد الأقصى لأيام الحجز</label>
                  <input
                    type="number"
                    name="maxBookingDays"
                    value={formData.maxBookingDays}
                    onChange={handleNumberChange}
                    min="1"
                    max="365"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>الحد الأدنى لعمر المستأجر</label>
                  <input
                    type="number"
                    name="minRenterAge"
                    value={formData.minRenterAge}
                    onChange={handleNumberChange}
                    min="18"
                    max="100"
                    style={styles.input}
                  />
                </div>

                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="requireIdVerification"
                    checked={formData.requireIdVerification}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>
                    طلب التحقق من الهوية قبل الحجز
                  </label>
                </div>

                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="allowCompanyRentals"
                    checked={formData.allowCompanyRentals}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>
                    السماح للشركات بتأجير السيارات
                  </label>
                </div>
              </div>
            )}

            {/* قسم الإشعارات */}
            {activeSection === 'notifications' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🔔 إعدادات الإشعارات</h3>
                
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>
                    إرسال إشعارات عبر البريد الإلكتروني للمستخدمين
                  </label>
                </div>

                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={formData.smsNotifications}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>
                    إرسال إشعارات عبر الرسائل النصية
                  </label>
                </div>

                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="adminEmailNotifications"
                    checked={formData.adminEmailNotifications}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>
                    إرسال إشعارات للمشرفين عند حجوزات جديدة
                  </label>
                </div>
              </div>
            )}

            {/* قسم نصوص الموقع */}
            {activeSection === 'texts' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📝 نصوص الموقع</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>شروط وأحكام</label>
                  <textarea
                    name="termsAndConditions"
                    value={formData.termsAndConditions}
                    onChange={handleChange}
                    rows="6"
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>سياسة الخصوصية</label>
                  <textarea
                    name="privacyPolicy"
                    value={formData.privacyPolicy}
                    onChange={handleChange}
                    rows="6"
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>من نحن</label>
                  <textarea
                    name="aboutUs"
                    value={formData.aboutUs}
                    onChange={handleChange}
                    rows="4"
                    style={styles.textarea}
                  />
                </div>
              </div>
            )}

            {/* قسم إعدادات الدفع */}
            {activeSection === 'payment' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>💳 إعدادات الدفع</h3>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>طرق الدفع المتاحة</label>
                  <div style={styles.paymentMethods}>
                    <label style={styles.paymentLabel}>
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods?.includes('card') || false}
                        onChange={() => handlePaymentMethodChange('card')}
                      />
                      بطاقة بنكية
                    </label>
                    <label style={styles.paymentLabel}>
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods?.includes('cash') || false}
                        onChange={() => handlePaymentMethodChange('cash')}
                      />
                      نقداً
                    </label>
                    <label style={styles.paymentLabel}>
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods?.includes('bank') || false}
                        onChange={() => handlePaymentMethodChange('bank')}
                      />
                      تحويل بنكي
                    </label>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>اسم البنك</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName || ''}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>رقم الحساب البنكي</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber || ''}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>IBAN</label>
                  <input
                    type="text"
                    name="bankIban"
                    value={formData.bankIban || ''}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            {/* القسم المتقدم */}
            {activeSection === 'advanced' && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>⚙️ إعدادات متقدمة</h3>
                
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={formData.maintenanceMode}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>
                    وضع الصيانة (الموقع مغلق للمستخدمين)
                  </label>
                </div>

                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="allowNewRegistrations"
                    checked={formData.allowNewRegistrations}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>
                    السماح بتسجيل حسابات جديدة
                  </label>
                </div>

                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    checked={formData.requireEmailVerification}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <label style={styles.checkboxLabel}>
                    طلب تفعيل البريد الإلكتروني
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* أزرار الحفظ */}
        <div style={styles.footer}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.saveButton,
              backgroundColor: loading ? '#6c757d' : '#28a745',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'جاري الحفظ...' : '💾 حفظ جميع الإعدادات'}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={styles.resetButton}
          >
            🔄 إعادة تحميل
          </button>
        </div>
      </form>
    </div>
  );
};

// الأنماط (styles) - كما هي من قبل
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
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
  },
  mainLayout: {
    display: 'flex',
    gap: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    minHeight: '500px',
  },
  sidebar: {
    width: '200px',
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px 0 0 8px',
    borderLeft: '1px solid #ddd',
  },
  sidebarButton: {
    width: '100%',
    padding: '12px',
    marginBottom: '5px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'right',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s',
  },
  sidebarIcon: {
    fontSize: '18px',
  },
  content: {
    flex: 1,
    padding: '20px',
  },
  section: {
    maxWidth: '600px',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
    fontSize: '18px',
    paddingBottom: '10px',
    borderBottom: '2px solid #007bff',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    resize: 'vertical',
  },
  fileInput: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
  },
  previewContainer: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoPreview: {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '5px',
  },
  faviconPreview: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '2px',
  },
  removeButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  helpText: {
    display: 'block',
    marginTop: '5px',
    fontSize: '12px',
    color: '#666',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer',
  },
  paymentMethods: {
    display: 'flex',
    gap: '20px',
    marginTop: '5px',
  },
  paymentLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#333',
  },
  footer: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  resetButton: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default SettingsTab;