const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  driverLicense: { 
    type: String, 
    required: true 
  }, // رابط صورة رخصة القيادة
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  rejectedReason: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date 
  }
});

// تحديث updatedAt قبل الحفظ
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// فهارس لتحسين الأداء
documentSchema.index({ userId: 1 });
documentSchema.index({ status: 1 });

module.exports = mongoose.model('Document', documentSchema);