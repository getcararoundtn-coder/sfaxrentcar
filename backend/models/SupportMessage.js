const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['user', 'company', 'admin'],
    default: 'user'
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  adminReply: {
    text: { type: String, trim: true },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repliedAt: { type: Date }
  },
  isRead: {
    type: Boolean,
    default: false
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
supportMessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// فهارس لتحسين الأداء
supportMessageSchema.index({ status: 1, createdAt: -1 });
supportMessageSchema.index({ userId: 1 });
supportMessageSchema.index({ isRead: 1 });
supportMessageSchema.index({ priority: 1 });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);