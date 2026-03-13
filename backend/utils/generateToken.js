const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  // تخزين التوكن في httpOnly cookie - نهائي للإنتاج
  res.cookie('token', token, {
    httpOnly: true,
    secure: true, // إجباري مع sameSite none
    sameSite: 'none', // يسمح بالإرسال عبر المواقع
    domain: '.onrender.com',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 أيام
  });
};

module.exports = generateToken;