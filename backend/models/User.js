const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'company', 'admin'], 
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
  // ✅ إضافة حقول تقييم المؤجر
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
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

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