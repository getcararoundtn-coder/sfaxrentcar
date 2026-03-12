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
      'new_message'  // ✅ متأكد من وجودها
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

module.exports = mongoose.model('Notification', notificationSchema);