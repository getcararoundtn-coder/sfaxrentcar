const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  carId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Car', 
    required: true 
  }, // ✅ جديد: لتسهيل عرض اسم السيارة
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  }, // ✅ تغيير من text إلى message للتوحيد
  isRead: { 
    type: Boolean, 
    default: false 
  }, // ✅ تغيير من read إلى isRead
  readAt: { 
    type: Date 
  }, // ✅ جديد: وقت القراءة
  deletedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: true // ✅ إضافة createdAt و updatedAt تلقائياً
});

// فهارس لتحسين الأداء
messageSchema.index({ bookingId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ carId: 1 });

module.exports = mongoose.model('Message', messageSchema);