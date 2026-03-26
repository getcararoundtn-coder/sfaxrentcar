const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Middleware لحماية المسارات
const protect = async (req, res, next) => {
  console.log("\n===== 🔐 AUTH DEBUG =====");
  console.log("1. Cookies:", req.cookies);
  console.log("2. Authorization Header:", req.headers.authorization);
  console.log("3. Content-Type:", req.headers['content-type']);
  console.log("4. Origin:", req.headers.origin);
  console.log("5. URL:", req.method, req.url);
  
  let token;
  
  // ✅ قراءة التوكن من cookies أولاً
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log("6. ✅ Token found in cookies");
  }
  // ✅ إذا لم يوجد، اقرأ من Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log("6. ✅ Token found in Authorization header");
  }
  // ✅ إذا لم يوجد في أي مكان
  else {
    console.log("6. ❌ No token found anywhere");
    return res.status(401).json({ 
      success: false, 
      message: 'غير مصرح، يرجى تسجيل الدخول' 
    });
  }
  
  try {
    // ✅ التحقق من صحة التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("7. ✅ Token verified, user ID:", decoded.id);
    
    // ✅ جلب المستخدم من قاعدة البيانات
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      console.log("8. ❌ User not found in database");
      return res.status(401).json({ 
        success: false, 
        message: 'مستخدم غير موجود' 
      });
    }
    
    console.log("8. ✅ User found:", req.user.email, "Role:", req.user.role);
    console.log("===== ✅ AUTH SUCCESS =====\n");
    next();
  } catch (error) {
    console.log("7. ❌ Token verification failed:", error.message);
    console.log("===== ❌ AUTH FAILED =====\n");
    return res.status(401).json({ 
      success: false, 
      message: 'توكن غير صالح أو منتهي الصلاحية' 
    });
  }
};

// ✅ Middleware للتحقق من دور المستخدم (Admin فقط)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'غير مصرح، هذه الصفحة للمشرفين فقط' 
    });
  }
};

// ✅ Middleware للتحقق من دور المستخدم (Partner أو Admin)
const partnerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'partner' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'غير مصرح، هذه الصفحة للشركاء والمشرفين فقط' 
    });
  }
};

// ✅ Middleware للتحقق من دور المستخدم (Owner أو Company أو Admin)
const ownerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'owner' || req.user.role === 'company' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'غير مصرح، هذه الصفحة لأصحاب السيارات فقط' 
    });
  }
};

module.exports = { protect, admin, partnerOrAdmin, ownerOrAdmin };