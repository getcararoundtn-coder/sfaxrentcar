const jwt = require('jsonwebtoken');
const User = require('../models/User');

// حماية المسارات (يتطلب تسجيل الدخول)
exports.protect = async (req, res, next) => {
  try {
    // ✅ إضافة console.log للتصحيح
    console.log('🔵🔵🔵 AUTH MIDDLEWARE 🔵🔵🔵');
    console.log('Cookies:', req.cookies);
    console.log('Token from cookie:', req.cookies?.token);
    
    // قراءة التوكن من الكوكيز
    const token = req.cookies.token;
    if (!token) {
      console.log('❌ No token found in cookies');
      return res.status(401).json({ message: 'غير مصرح به، يرجى تسجيل الدخول' });
    }
    
    console.log('✅ Token found, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }
    
    console.log('✅ User authenticated:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ message: 'توكن غير صالح' });
  }
};

// التحقق من دور المشرف
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'غير مصرح، هذه الصفحة للمشرف فقط' });
  }
};

// التحقق من أن الحساب مفعل (للاستخدام المستقبلي)
exports.approvedOnly = (req, res, next) => {
  if (req.user && req.user.status === 'approved') {
    next();
  } else {
    return res.status(403).json({ message: 'حسابك غير مفعل بعد' });
  }
};