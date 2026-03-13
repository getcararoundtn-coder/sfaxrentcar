const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  // تخزين التوكن في httpOnly cookie مع إعدادات صالحة للإنتاج
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,               // إلزامي مع sameSite=none وفي الإنتاج HTTPS
    sameSite: 'none',            // يسمح بإرسال الكوكي من أي مصدر (Cross-site)
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 أيام
    // لا نستخدم خاصية domain على الإطلاق
  });
};

module.exports = generateToken;