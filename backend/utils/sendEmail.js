const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // إعدادات Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail', // اختصار مدمج في Nodemailer [citation:6][citation:7]
    auth: {
      user: process.env.EMAIL_USER, // بريدك الإلكتروني (مثل: getcararoundtn@gmail.com)
      pass: process.env.EMAIL_PASS  // كلمة مرور التطبيق (App Password) المكونة من 16 حرفاً [citation:3][citation:4]
    },
    tls: {
      rejectUnauthorized: false // يساعد في تجاوز مشاكل الشهادات في بعض البيئات
    }
  });

  // خيارات البريد الإلكتروني
  const mailOptions = {
    from: `"SfaxRentCar" <${process.env.EMAIL_USER}>`, // المستلم سيرى هذا الاسم والبريد
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // إرسال البريد مع تسجيل الأخطاء للتصحيح
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via Gmail:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Gmail error details:', error);
    throw error; // إعادة الخطأ لمعالجته في الـ authController
  }
};

module.exports = sendEmail;