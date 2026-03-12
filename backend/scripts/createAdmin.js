const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const admin = await User.findOne({ email: 'mokhles.trading@gmail.com' });
    if (!admin) {
      await User.create({
        name: 'Mokhles Admin',
        email: 'mokhles.trading@gmail.com',
        password: 'Levis1992*&',
        phone: '00000000',
        role: 'admin',
        status: 'approved',
        verificationStatus: 'verified',
        documentsSubmitted: true,
        documentsVerified: true,
        acceptedTerms: true,
        acceptedPrivacy: true
      });
      console.log('✅ Admin created');
    } else {
      console.log('⚠️ Admin already exists');
    }
    process.exit();
  });