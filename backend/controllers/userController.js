const User = require('../models/User');

// ================== USER ==================

exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "غير مصرح" });
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================== ADMIN ==================

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    await User.deleteOne({ _id: req.params.id });
    res.json({
      success: true,
      message: "تم حذف المستخدم"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE =================

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود"
      });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.city = req.body.city || user.city;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "تم تحديث الملف الشخصي",
      data: updatedUser
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في تحديث الملف الشخصي"
    });
  }
};

// ================== OWNER RATING ==================

// @desc    جلب تقييم المؤجر
// @route   GET /api/users/:id/rating
// @access  Public
exports.getUserRating = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('ownerRating ownerRatingCount name');
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    res.json({
      success: true,
      data: {
        rating: user.ownerRating || 0,
        count: user.ownerRatingCount || 0,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ message: error.message });
  }
};