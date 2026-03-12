const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  renter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  car_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  content: { type: String, required: true },
  pdf_url: { type: String },
  signed_by_renter: { type: Boolean, default: false },
  signed_by_owner: { type: Boolean, default: false },
  signed_at: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Contract || mongoose.model('Contract', contractSchema);