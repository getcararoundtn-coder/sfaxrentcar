const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    // فرض استخدام IPv4
    lookup: (hostname, options, callback) => {
      require('dns').lookup(hostname, { family: 4 }, callback);
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