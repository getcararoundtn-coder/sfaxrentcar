const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
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
  text: { 
    type: String, 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  deletedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // من حذف الرسالة؟
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// فهارس لتحسين الأداء
messageSchema.index({ bookingId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ read: 1 });

module.exports = mongoose.model('Message', messageSchema);