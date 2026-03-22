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
      'booking_pending', 'booking_approved', 'booking_rejected', 
      'booking_completed', 'booking_cancelled',
      'document_pending', 'document_verified', 'document_rejected',
      'car_pending', 'car_approved', 'car_rejected',
      'message_reply',
      'new_review',
      'new_user',
      'new_message',
      'support_new',     // ✅ إشعار للمشرف عند استلام رسالة دعم جديدة
      'support_reply'    // ✅ إشعار للمستخدم عند رد المشرف
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