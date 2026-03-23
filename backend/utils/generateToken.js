const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  // ✅ إعدادات الكوكيز المتوافقة مع Safari و iPhone
  const isProduction = process.env.NODE_ENV === 'production';
  
  // في بيئة التطوير، استخدم إعدادات مختلفة
  if (!isProduction) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,           // false في التطوير (HTTP)
      sameSite: 'lax',         // lax للتطوير المحلي
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 أيام
    });
  } else {
    // في بيئة الإنتاج (Render)
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,            // إلزامي مع sameSite=none
      sameSite: 'none',        // يسمح بإرسال الكوكي من أي مصدر (Cross-site)
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 أيام
    });
  }
  
  console.log(`🔐 Token generated for user: ${userId}`);
  console.log(`   Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`   Secure: ${isProduction}, SameSite: ${isProduction ? 'none' : 'lax'}`);
};

module.exports = generateToken;