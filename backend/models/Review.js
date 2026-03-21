const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true,
    unique: true // كل حجز يمكن تقييمه مرة واحدة فقط
  },
  carId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Car', 
    required: true 
  },
  reviewerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
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
    default: true // يمكن تغييره لاحقاً لمراجعة المشرف
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

// فهرسة لتحسين الأداء
reviewSchema.index({ carId: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ ownerId: 1 });
reviewSchema.index({ isApproved: 1 });

module.exports = mongoose.model('Review', reviewSchema);