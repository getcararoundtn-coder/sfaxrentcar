const User = require('../models/User');
const Car = require('../models/Car');

// @desc    جلب الشركات المميزة (للواجهة الرئيسية)
// @route   GET /api/companies/featured
// @access  Public
exports.getFeaturedCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: 'professional', verificationStatus: 'approved' })
      .select('companyName location logo carsCount')
      .limit(6)
      .lean();

    const result = await Promise.all(
      companies.map(async (company) => {
        const carsCount = await Car.countDocuments({ owner_id: company._id, status: 'approved' });
        return { ...company, carsCount };
      })
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in getFeaturedCompanies:', error);
    res.status(500).json({ message: error.message });
  }
};