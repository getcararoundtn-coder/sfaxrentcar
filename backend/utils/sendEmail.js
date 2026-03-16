const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
  // تعيين مفتاح API من المتغيرات البيئية
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: options.email,
    from: 'getcararoundtn@gmail.com', // بريدك المُستخدم كمرسل
    subject: options.subject,
    html: options.html,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent via SendGrid to:', options.email);
  } catch (error) {
    console.error('❌ SendGrid error:', error.response?.body || error);
    throw error;
  }
};

module.exports = sendEmail;