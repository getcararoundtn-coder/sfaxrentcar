const mongoose = require('mongoose');

const userDocumentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  idFront: { type: String, required: true },
  idBack: { type: String, required: true },
  licenseFront: { type: String, required: true },
  licenseBack: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.UserDocument || mongoose.model('UserDocument', userDocumentSchema);