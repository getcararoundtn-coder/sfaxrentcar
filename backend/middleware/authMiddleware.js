const jwt = require('jsonwebtoken');
const User = require('../models/User');

// حماية المسارات (يتطلب تسجيل الدخول)
exports.protect = async (req, res, next) => {
  try {
    // قراءة التوكن من الكوكيز
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'غير مصرح به، يرجى تسجيل الدخول' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }
    next();
  } catch (error) {
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