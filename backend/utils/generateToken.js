const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  const isProduction = process.env.NODE_ENV === 'production';
  
  // ✅ إعدادات الكوكيز المتوافقة مع التصفح الخاص
  const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    path: '/'
  };
  
  if (!isProduction) {
    // بيئة التطوير
    cookieOptions.secure = false;
    cookieOptions.sameSite = 'lax';
  } else {
    // بيئة الإنتاج
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none';
    // ✅ إضافة partitioned لتحسين التوافق مع التصفح الخاص
    cookieOptions.partitioned = true;
  }
  
  res.cookie('token', token, cookieOptions);
  
  console.log(`🔐 Token generated for user: ${userId}`);
  console.log(`   Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`   Secure: ${cookieOptions.secure}, SameSite: ${cookieOptions.sameSite}`);
  console.log(`   Partitioned: ${cookieOptions.partitioned || false}`);
};

module.exports = generateToken;