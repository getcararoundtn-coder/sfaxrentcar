const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: {
    type: String,
    enum: [
      // ✅ إشعارات الحجوزات
      'booking_created',      // ✅ جديد - عند إنشاء حجز
      'booking_pending', 
      'booking_approved', 
      'booking_rejected', 
      'booking_completed', 
      'booking_cancelled',
      // ✅ إشعارات الوثائق
      'document_pending', 
      'document_verified', 
      'document_rejected',
      // ✅ إشعارات السيارات
      'car_pending', 
      'car_approved', 
      'car_rejected',
      // ✅ إشعارات الرسائل
      'message_reply',
      'new_review',
      'new_user',
      'new_message',
      // ✅ إشعارات الدعم
      'support_new',
      'support_reply'
    ],
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// فهرسة لتحسين الأداء
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);