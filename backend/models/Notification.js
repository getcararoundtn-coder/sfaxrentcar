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
      'booking_created',
      'booking_pending', 
      'booking_accepted',  // ✅ تغيير من booking_approved إلى booking_accepted
      'booking_refused',   // ✅ تغيير من booking_rejected إلى booking_refused
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
      'new_message',      // ✅ للإشعارات الجديدة للرسائل
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
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'  // ✅ إضافة reference dynamic
  },
  relatedModel: {
    type: String,
    enum: ['Booking', 'Car', 'User', 'Document', 'Message']
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },  // ✅ تغيير من read إلى isRead
  readAt: { 
    type: Date 
  },  // ✅ جديد: وقت القراءة
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true  // ✅ إضافة updatedAt
});

// فهرسة لتحسين الأداء
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);