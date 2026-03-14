require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration محسّنة للإنتاج
const allowedOrigins = [
  'http://localhost:3000',
  'https://sfaxrentcar-frontend-x281.onrender.com' // ✅ الرابط الجديد للـ Frontend
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // السماح للطلبات بدون origin (مثل Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.warn('🚫 CORS blocked origin:', origin);
      const msg = 'سياسة CORS تمنع الوصول من هذا المصدر';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // هذا يسمح بإرسال الكوكيز
  optionsSuccessStatus: 200
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contractRoutes = require('./routes/contractRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const companyRoutes = require('./routes/companyRoutes');
const settingRoutes = require('./routes/settingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));