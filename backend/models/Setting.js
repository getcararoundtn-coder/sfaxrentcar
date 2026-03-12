const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  platformName: { type: String, default: 'SfaxRentCar' },
  currency: { type: String, default: 'TND' },
  serviceFee: { type: Number, default: 10 }, // نسبة العمولة
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  requireIdVerification: { type: Boolean, default: true },
  allowProfessionalRentals: { type: Boolean, default: true },
  maxBookingDays: { type: Number, default: 30 },
  minRenterAge: { type: Number, default: 21 },
  supportEmail: { type: String, default: 'support@sfaxrentcar.com' },
  supportPhone: { type: String, default: '+21612345678' },
  aboutUs: { type: String, default: '' },
  termsAndConditions: { type: String, default: '' },
  privacyPolicy: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema);