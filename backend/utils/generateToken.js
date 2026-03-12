const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  // تخزين التوكن في httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true في الإنتاج
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 أيام
  });
};

module.exports = generateToken;
