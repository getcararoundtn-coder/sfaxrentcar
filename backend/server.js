require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const app = express();

// ✅ تحسينات الأداء
app.set('trust proxy', 1);
app.disable('x-powered-by');

// ✅ إعدادات multer
const upload = multer({ 
  dest: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Utilisez JPG, PNG ou WEBP.'), false);
    }
  }
});

// ✅ Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ✅ CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://drivetunisia.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn('🚫 CORS blocked origin:', origin);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

// ✅ تحسين إعدادات MongoDB
mongoose.set('strictQuery', true);
mongoose.set('debug', false);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 10000,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
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
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notifications', notificationRoutes);

// ========== ✅ ENDPOINT TEMPORAIRE POUR FIXER LE BOOKING ==========
app.get('/api/fix-booking/:id', async (req, res) => {
  try {
    const Booking = require('./models/Booking');
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const oldStatus = booking.status;
    booking.status = 'accepted';
    await booking.save();
    console.log(`✅ Booking ${req.params.id} status changed from ${oldStatus} to accepted`);
    res.json({ 
      success: true, 
      message: 'Booking status updated to accepted',
      oldStatus,
      newStatus: booking.status,
      booking: {
        id: booking._id,
        carId: booking.carId,
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate
      }
    });
  } catch (error) {
    console.error('❌ Error fixing booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Endpoint pour voir les détails du booking
app.get('/api/check-booking/:id', async (req, res) => {
  try {
    const Booking = require('./models/Booking');
    const booking = await Booking.findById(req.params.id)
      .populate('carId', 'brand model')
      .populate('renterId', 'first_name last_name email')
      .populate('ownerId', 'first_name last_name email');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    res.json({ 
      success: true, 
      booking: {
        id: booking._id,
        status: booking.status,
        car: booking.carId ? `${booking.carId.brand} ${booking.carId.model}` : 'Unknown',
        renter: booking.renterId ? `${booking.renterId.first_name} ${booking.renterId.last_name}` : 'Unknown',
        owner: booking.ownerId ? `${booking.ownerId.first_name} ${booking.ownerId.last_name}` : 'Unknown',
        startDate: booking.startDate,
        endDate: booking.endDate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// ========== FIN ENDPOINTS TEMPORAIRES ==========

// Test & Health Check Endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DriveTunisia API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// ✅ إنشاء الخادم
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Test URL: http://localhost:${PORT}/api/test`);
  console.log(`❤️  Health URL: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Fix booking URL: http://localhost:${PORT}/api/fix-booking/BOOKING_ID`);
  console.log(`🔍 Check booking URL: http://localhost:${PORT}/api/check-booking/BOOKING_ID`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 File upload limit: 50MB (via multer)`);
  console.log(`⏱️ Server timeout: ${server.timeout / 1000} seconds`);
});

// ✅ إعدادات المهلة
server.timeout = 120000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// ✅ تصدير upload لاستخدامه في routes
module.exports = { upload };