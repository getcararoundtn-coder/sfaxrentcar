const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const adminEmail = 'mokhles.trading@gmail.com';
    const newPassword = 'Levis1992*&';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await User.updateOne(
      { email: adminEmail },
      { password: hashedPassword }
    );
    
    if (result.matchedCount === 0) {
      console.log('❌ لم يتم العثور على مستخدم admin، سيتم إنشاؤه...');
      await User.create({
        name: 'Mokhles Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '00000000',
        role: 'admin',
        status: 'approved',
        verificationStatus: 'verified',
        documentsSubmitted: true,
        documentsVerified: true,
        acceptedTerms: true,
        acceptedPrivacy: true
      });
      console.log('✅ تم إنشاء حساب admin');
    } else {
      console.log('✅ تم تحديث كلمة مرور admin');
    }
    
    process.exit();
  })
  .catch(err => {
    console.error('❌ خطأ:', err);
    process.exit(1);
  });