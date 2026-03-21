const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  carId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Car', 
    required: true 
  },
  renterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  durationDays: { 
    type: Number 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  platformCommission: { 
    type: Number, 
    default: 0 
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'refused', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'paid'], 
    default: 'unpaid' 
  },
  contractPdf: { 
    type: String 
  },
  signed: { 
    type: Boolean, 
    default: false 
  },
  hasReview: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// حساب مدة الحجز تلقائياً قبل الحفظ
bookingSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.durationDays = diffDays;
  }
  next();
});

// فهرسة لتحسين الأداء
bookingSchema.index({ carId: 1, status: 1 });
bookingSchema.index({ renterId: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);