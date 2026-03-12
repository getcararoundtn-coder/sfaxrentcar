import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings');
      setSettings(data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      // بيانات افتراضية في حالة فشل الاتصال بالخادم
      setSettings({
        // معلومات المنصة
        platformName: 'SfaxRentCar',
        platformLogo: '',
        platformFavicon: '',
        
        // معلومات الاتصال - تم التحديث
        contactEmail: 'getcararoundtn@gmail.com', // ✅ تم التحديث
        contactPhone: '+216 12 345 678',
        contactAddress: 'صفاقس، تونس',
        
        // التواصل الاجتماعي
        facebook: 'https://facebook.com/sfaxrentcar',
        instagram: 'https://instagram.com/sfaxrentcar',
        twitter: 'https://twitter.com/sfaxrentcar',
        linkedin: 'https://linkedin.com/company/sfaxrentcar',
        
        // العمولات والرسوم
        commissionRate: 10,
        minCommission: 5,
        maxCommission: 50,
        
        // إعدادات الحجوزات
        maxBookingDays: 30,
        minRenterAge: 21,
        requireIdVerification: true,
        allowCompanyRentals: true,
        
        // الإشعارات
        emailNotifications: true,
        smsNotifications: false,
        adminEmailNotifications: true,
        
        // نصوص الموقع
        termsAndConditions: 'شروط وأحكام المنصة...',
        privacyPolicy: 'سياسة الخصوصية...',
        aboutUs: 'منصة SfaxRentCar هي منصة تونسية لكراء السيارات بين الأفراد والشركات...',
        
        // إعدادات الدفع
        paymentMethods: ['card', 'cash'],
        bankName: '',
        bankAccountNumber: '',
        bankIban: '',
        
        // إعدادات متقدمة
        maintenanceMode: false,
        allowNewRegistrations: true,
        requireEmailVerification: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};