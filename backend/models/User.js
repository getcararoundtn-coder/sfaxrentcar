const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: false, default: '' },
  role: { 
    type: String, 
    enum: ['user', 'owner', 'company', 'admin'], 
    default: 'user' 
  },
  status: { 
    type: String, 
    enum: ['active', 'suspended'], 
    default: 'active' 
  },
  verificationStatus: { 
    type: String, 
    enum: ['not_submitted', 'pending', 'approved', 'rejected'], 
    default: 'not_submitted' 
  },
  // ✅ حقول تقييم المؤجر
  ownerRating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },
  ownerRatingCount: { 
    type: Number, 
    default: 0 
  },
  // ✅ Firebase UID (لربط حسابات Firebase)
  firebaseUid: { 
    type: String, 
    unique: true, 
    sparse: true,
    index: true
  },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// ✅ الفهارس (Indexes) لتسريع البحث
userSchema.index({ email: 1 });           // للبحث السريع بالبريد الإلكتروني
userSchema.index({ firebaseUid: 1 });     // للبحث السريع بـ Firebase UID
userSchema.index({ role: 1 });            // للبحث حسب الدور
userSchema.index({ status: 1 });          // للبحث حسب الحالة
userSchema.index({ verificationStatus: 1 }); // للبحث حسب حالة التحقق

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);