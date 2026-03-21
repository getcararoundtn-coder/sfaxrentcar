const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  licensePlate: { type: String, required: true },
  insuranceFront: { type: String },
  insuranceBack: { type: String },
  contractPdf: { type: String },
  pricePerDay: { type: Number, required: true },
  deposit: { type: Number, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  delegation: { type: String, required: true },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'], required: true },
  transmission: { type: String, enum: ['manual', 'automatic'], required: true },
  seats: { type: Number, required: true },
  doors: { type: Number, required: true, min: 2, max: 6 },
  mileage: { type: Number, required: true },
  features: [{ type: String }], // مثال: ['GPS', 'Bluetooth', 'Air Conditioning']
  images: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Car', carSchema);