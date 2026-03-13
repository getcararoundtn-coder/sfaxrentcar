const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  // تخزين التوكن في httpOnly cookie - معدل للإنتاج
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true في الإنتاج
    sameSite: 'lax',
    domain: '.onrender.com', // ✅ domain صحيح ليشمل جميع نطاقات Render
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 أيام
  });
};

module.exports = generateToken;