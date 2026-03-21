const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // معلومات المنصة
  platformName: { type: String, default: 'DriveTunisia' },
  platformLogo: { type: String, default: '' },
  platformFavicon: { type: String, default: '' },
  currency: { type: String, default: 'TND' },
  
  // معلومات الاتصال
  contactEmail: { type: String, default: 'support@drivetunisia.com' },
  contactPhone: { type: String, default: '+21612345678' },
  contactAddress: { type: String, default: '' },
  
  // التواصل الاجتماعي
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  twitter: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  
  // العمولات والرسوم
  commissionRate: { type: Number, default: 0 }, // نسبة العمولة (0% في البداية)
  minCommission: { type: Number, default: 5 },
  maxCommission: { type: Number, default: 50 },
  
  // إعدادات الحجوزات
  maxBookingDays: { type: Number, default: 30 },
  minRenterAge: { type: Number, default: 21 },
  requireIdVerification: { type: Boolean, default: true },
  allowProfessionalRentals: { type: Boolean, default: true },
  
  // الإشعارات
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  adminEmailNotifications: { type: Boolean, default: true },
  
  // النصوص القانونية
  aboutUs: { type: String, default: '' },
  termsAndConditions: { type: String, default: '' },
  privacyPolicy: { type: String, default: '' },
  
  // إعدادات الدفع
  paymentMethods: [{ type: String, default: ['card', 'cash'] }],
  bankName: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  bankIban: { type: String, default: '' },
  
  // إعدادات متقدمة
  maintenanceMode: { type: Boolean, default: false },
  allowNewRegistrations: { type: Boolean, default: true },
  requireEmailVerification: { type: Boolean, default: false },
  platformMode: { type: String, enum: ['launch', 'growth', 'professional'], default: 'launch' }
}, { timestamps: true });

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema);