const mongoose = require('mongoose');

const carDraftSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // البيانات المؤقتة (كل خطوة)
  step: { type: Number, default: 1 },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // حالة المسودة
  isCompleted: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

carDraftSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CarDraft', carDraftSchema);