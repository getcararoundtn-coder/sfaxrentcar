const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// تسجيل مستخدم
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // التحقق من المدخلات
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

    // ✅ إضافة role إلى إنشاء المستخدم (افتراضي 'user' إذا لم يتم إرساله)
    const user = await User.create({ 
      name, 
      email, 
      password, 
      phone,
      role: role || 'user' // إذا لم يتم إرسال role، يصبح 'user'
    });
    generateToken(res, user._id);

    // 🔔 إشعار للمشرفين بمستخدم جديد
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

// تسجيل الدخول
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من المدخلات
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
      });
    }

    generateToken(res, user._id);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
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
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'حدث خطأ في الخادم' 
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

// بيانات المستخدم الحالي
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
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

    // إنشاء توكن عشوائي
    const resetToken = crypto.randomBytes(32).toString('hex');

    // تشفير التوكن وحفظه في قاعدة البيانات
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 دقيقة
    await user.save();

    // استخدام FRONTEND_URL من المتغيرات البيئية
    const frontendUrl = process.env.FRONTEND_URL || 'https://drivetunisia.onrender.com';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h2 style="color: #333; text-align: center;">إعادة تعيين كلمة المرور</h2>
        <p style="font-size: 16px;">مرحباً ${user.name}،</p>
        <p style="font-size: 16px;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في <strong>DriveTunisia</strong>.</p>
        <p style="font-size: 16px;">الرجاء الضغط على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #6b46c0; color: white; text-decoration: none; border-radius: 4px; font-size: 16px;">إعادة تعيين كلمة المرور</a>
        </div>
        <p style="font-size: 14px; color: #666;">هذا الرابط صالح لمدة 30 دقيقة فقط.</p>
        <p style="font-size: 14px; color: #666;">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.</p>
        <hr style="margin: 30px 0;">
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

      return res.status(500).json({ message: 'فشل إرسال البريد الإلكتروني. تأكد من إعدادات البريد.' });
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

    // تشفير التوكن والمقارنة مع المخزن في قاعدة البيانات
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية' });
    }

    // تحديث كلمة المرور
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