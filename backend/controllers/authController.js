const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// تسجيل مستخدم
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'جميع الحقول مطلوبة' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل' 
      });
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      phone,
      role: role || 'user'
    });
    generateToken(res, user._id);

    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          type: 'new_user',
          title: '👤 مستخدم جديد',
          message: `قام ${user.name} بالتسجيل في المنصة`,
          relatedId: user._id
        });
      }
      console.log('✅ إشعارات المشرفين تم إرسالها');
    } catch (notifError) {
      console.error('❌ فشل إنشاء إشعار للمشرفين:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'حدث خطأ في الخادم' 
    });
  }
};

// ✅ تسجيل الدخول العادي (فائق السرعة)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
      });
    }

    // ✅ استعلام سريع مع lean() و select() و maxTimeMS
    const user = await User.findOne({ email })
      .select('_id name email role verificationStatus password')
      .lean()
      .maxTimeMS(3000); // حد أقصى 3 ثواني

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
      });
    }

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
      });
    }

    // ✅ إزالة كلمة المرور
    delete user.password;

    // ✅ إنشاء التوكن
    generateToken(res, user._id);

    // ✅ رد سريع بدون رسالة إضافية
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'حدث خطأ في الخادم' 
    });
  }
};

// ✅ تسجيل الدخول عبر Firebase (محسن وسريع)
exports.firebaseLogin = async (req, res) => {
  try {
    console.log('🔥 Firebase login request received:', req.body);
    const { firebaseUid, email, name, role } = req.body;

    if (!firebaseUid || !email) {
      console.error('❌ Missing firebaseUid or email:', { firebaseUid, email });
      return res.status(400).json({ 
        success: false,
        message: 'بيانات Firebase غير كاملة' 
      });
    }

    // ✅ البحث عن المستخدم بالبريد الإلكتروني (محسن)
    let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
      .select('_id name email role status verificationStatus firebaseUid')
      .lean()
      .maxTimeMS(3000);

    // إذا لم يوجد، جرب البحث بـ firebaseUid
    if (!user) {
      user = await User.findOne({ firebaseUid })
        .select('_id name email role status verificationStatus firebaseUid')
        .lean()
        .maxTimeMS(3000);
    }

    if (!user) {
      // ✅ إنشاء مستخدم جديد
      const userRole = role || 'user';
      console.log(`📝 Creating new user for: ${email} with role: ${userRole}`);
      
      const newUser = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: crypto.randomBytes(20).toString('hex'),
        phone: '',
        role: userRole,
        verificationStatus: 'not_submitted',
        firebaseUid
      });
      
      user = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        verificationStatus: newUser.verificationStatus,
        firebaseUid: newUser.firebaseUid
      };
      console.log('✅ New user created via Firebase:', user.email, 'Role:', user.role);
    } else {
      // تحديث Firebase UID إذا لم يكن موجوداً
      if (!user.firebaseUid) {
        await User.updateOne({ _id: user._id }, { $set: { firebaseUid } });
        user.firebaseUid = firebaseUid;
        console.log('✅ Updated existing user with firebaseUid:', user.email);
      }
      console.log('✅ Existing user logged in via Firebase:', user.email, 'Role:', user.role);
    }

    // إنشاء توكن للمستخدم
    generateToken(res, user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Firebase login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'حدث خطأ في تسجيل الدخول عبر Firebase: ' + error.message
    });
  }
};

// تسجيل الخروج
exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ success: true, message: 'تم تسجيل الخروج' });
};

// ✅ بيانات المستخدم الحالي (محسن)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();
    console.log('🔵 getMe - user role:', user.role);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// نسيت كلمة المرور - إرسال رابط إعادة التعيين
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'لا يوجد حساب بهذا البريد الإلكتروني' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'https://drivetunisia.onrender.com';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h2 style="color: #333; text-align: center;">إعادة تعيين كلمة المرور</h2>
        <p>مرحباً ${user.name}،</p>
        <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في <strong>DriveTunisia</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="padding: 12px 30px; background-color: #6b46c0; color: white; text-decoration: none; border-radius: 4px;">إعادة تعيين كلمة المرور</a>
        </div>
        <p>هذا الرابط صالح لمدة 30 دقيقة فقط.</p>
        <hr>
        <p style="color: #666; font-size: 12px; text-align: center;">DriveTunisia - منصة كراء السيارات</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'إعادة تعيين كلمة المرور - DriveTunisia',
        html: message
      });
      res.json({ success: true, message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني' });
    } catch (error) {
      console.error('❌ فشل إرسال البريد الإلكتروني:', error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'فشل إرسال البريد الإلكتروني' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

// إعادة تعيين كلمة المرور
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};