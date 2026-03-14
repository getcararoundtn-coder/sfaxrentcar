const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // إنشاء ناقل البريد مع خيارات محسنة
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true للـ port 465, false للـ ports الأخرى
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // 🔥 يتجاوز مشاكل الشهادات في بعض البيئات
    },
    // مهلة الاتصال (بالمللي ثانية)
    connectionTimeout: 60000, // 60 ثانية
    greetingTimeout: 30000, // 30 ثانية
    socketTimeout: 60000 // 60 ثانية
  });

  // خيارات البريد الإلكتروني
  const mailOptions = {
    from: `"SfaxRentCar" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // إرسال البريد مع تسجيل أي أخطاء
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending error details:', error);
    throw error; // إعادة رمي الخطأ لمعالجته في الـ controller
  }
};

module.exports = sendEmail;