const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // الخطوة 1: معلومات أساسية
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  mileage: { 
    type: String, 
    enum: ['0-15000', '15000-50000', '50000-100000', '100000-150000', '150000-200000', '200000+'],
    required: true 
  },
  
  // الخطوة 2: لوحة السيارة
  licensePlate: { type: String, required: true },
  registrationCountry: { type: String, enum: ['Tunisie', 'Libye', 'Algérie', 'Maroc'], default: 'Tunisie' },
  registrationYear: { type: Number, required: true },
  
  // الخطوة 4: تفاصيل إضافية
  fuelType: { type: String, enum: ['Essence', 'Diesel', 'Hybride', 'Électrique', 'Autre'], required: true },
  transmission: { type: String, enum: ['Manuelle', 'Automatique'], required: true },
  
  // الخطوة 5: المقاعد والأبواب
  doors: { type: Number, min: 0, max: 7, default: 4 },
  seats: { type: Number, min: 1, max: 9, default: 5 },
  
  // الخطوة 6: المعدات (features)
  features: [{ type: String }], // GPS, Bluetooth, Climatisation, Caméra recul
  
  // الخطوة 7: نوع المستخدم
  userType: { type: String, enum: ['particulier', 'professionnel'], default: 'particulier' },
  
  // الخطوة 8: تاريخ الميلاد (للمؤجر)
  ownerBirthDate: { type: Date },
  
  // الخطوة 9: خطة الدفع
  paymentPlan: { type: String, enum: ['hebdomadaire', 'mensuel'], default: 'hebdomadaire' },
  
  // الخطوة 10: رقم الهاتف
  ownerPhone: { type: String },
  ownerPhoneCountry: { type: String, default: 'Tunisie' },
  
  // الخطوة 11: مكان ركن السيارة
  parkingType: { type: String, enum: ['parking privé', 'stationnement public'], required: true },
  
  // الخطوة 12: العنوان
  address: { type: String, required: true },
  city: { type: String, required: true },
  delegation: { type: String, required: true },
  
  // الخطوة 13: طريقة التسليم
  deliveryMethod: { type: String, enum: ['livraison au client', 'client rencontre le conducteur'], required: true },
  
  // السعر اليومي (سيتم تعيينه لاحقاً في Dashboard)
  pricePerDay: { type: Number, default: 0 },
  
  // صور السيارة
  images: [{ type: String }],
  
  // حالة السيارة
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  featuredExpiresAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// تحديث updatedAt قبل الحفظ
carSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Car', carSchema);