const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // يساعد في بيئات معينة
    }
  });

  const mailOptions = {
    from: `"SfaxRentCar" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via Gmail:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Gmail error:', error);
    throw error;
  }
};

module.exports = sendEmail;