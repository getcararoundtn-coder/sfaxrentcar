const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  const isProduction = process.env.NODE_ENV === 'production';
  
  // ✅ إعدادات الكوكيز الصحيحة (بدون domain)
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // true في الإنتاج (HTTPS)
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 أيام
  };
  
  // ❌ لا نضيف domain أبداً
  // ❌ لا نضيف partitioned (ليس ضرورياً)
  
  res.cookie('token', token, cookieOptions);
  
  console.log(`🔐 Token generated for user: ${userId}`);
  console.log(`   Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`   Secure: ${cookieOptions.secure}, SameSite: ${cookieOptions.sameSite}`);
};

module.exports = generateToken;