const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'غير مصرح، يرجى تسجيل الدخول' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'المستخدم غير موجود' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'توكن غير صالح' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'غير مصرح، هذه الصفحة للمشرف فقط' });
  }
};

exports.approvedOnly = (req, res, next) => {
  if (req.user && req.user.status === 'approved') {
    next();
  } else {
    return res.status(403).json({ message: 'حسابك غير مفعل بعد' });
  }
};