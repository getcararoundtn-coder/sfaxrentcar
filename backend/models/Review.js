const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // نوع التقييم: 'car' أو 'owner'
  type: {
    type: String,
    enum: ['car', 'owner'],
    required: true,
    default: 'car'
  },
  
  // للمرجع حسب النوع
  carId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Car'
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  
  // من قام بالتقييم
  reviewerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // من تم تقييمه (مستخدم أو سيارة)
  reviewedUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  
  // الحجز المرتبط بالتقييم
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true,
    unique: true // كل حجز يمكن تقييمه مرة واحدة فقط
  },
  
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  
  comment: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  
  isApproved: { 
    type: Boolean, 
    default: true 
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
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// فهارس لتحسين الأداء
reviewSchema.index({ type: 1 });
reviewSchema.index({ carId: 1, createdAt: -1 });
reviewSchema.index({ ownerId: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ reviewedUserId: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);