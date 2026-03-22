const Document = require('../models/Document');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadDocuments } = require('../config/cloudinary');

// @desc    رفع رخصة القيادة (توثيق المستخدم)
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocuments = async (req, res) => {
  uploadDocuments(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      // ✅ التحقق من وجود ملف واحد فقط (رخصة القيادة)
      if (!req.files || !req.files.driverLicense) {
        return res.status(400).json({ message: 'يرجى رفع صورة رخصة القيادة' });
      }

      const driverLicenseUrl = req.files.driverLicense[0].path;

      let document = await Document.findOne({ userId: req.user._id });
      if (document) {
        document.driverLicense = driverLicenseUrl;
        document.status = 'pending';
      } else {
        document = new Document({
          userId: req.user._id,
          driverLicense: driverLicenseUrl,
          status: 'pending'
        });
      }
      await document.save();

      await User.findByIdAndUpdate(req.user._id, { verificationStatus: 'pending' });

      // 🔔 إشعار للمشرفين بطلب تحقق جديد
      try {
        const admins = await User.find({ role: 'admin' }).select('_id');
        for (const admin of admins) {
          await Notification.create({
            userId: admin._id,
            type: 'document_pending',
            title: '📄 طلب تحقق جديد',
            message: `المستخدم ${req.user.name} يطلب توثيق حسابه`,
            relatedId: req.user._id
          });
        }
      } catch (notifError) {
        console.error('فشل إنشاء إشعار للمشرفين:', notifError);
      }

      res.json({ success: true, message: 'تم رفع رخصة القيادة بنجاح' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });
};

// @desc جلب وثائق المستخدم
// @route GET /api/documents/my-docs
// @access Private
exports.getMyDocuments = async (req, res) => {
  try {
    const doc = await Document.findOne({ userId: req.user._id });
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc جلب جميع الوثائق المعلقة (للمشرف)
// @route GET /api/documents/pending
// @access Private/Admin
exports.getPendingDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ status: 'pending' }).populate('userId', 'name email phone');
    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    الموافقة على وثائق المستخدم
// @route   PATCH /api/documents/:userId/approve
// @access  Private/Admin
exports.approveDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndUpdate(
      { userId: req.params.userId },
      { status: 'approved' },
      { new: true }
    );
    await User.findByIdAndUpdate(req.params.userId, { verificationStatus: 'approved' });

    // 🔔 إشعار للمستخدم
    try {
      await Notification.create({
        userId: req.params.userId,
        type: 'document_verified',
        title: '✅ تم توثيق حسابك',
        message: 'تمت الموافقة على وثائقك بنجاح، يمكنك الآن استخدام جميع خدمات المنصة.'
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار التوثيق:', notifError);
    }

    res.json({ success: true, message: 'تمت الموافقة' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    رفض وثائق المستخدم
// @route   PATCH /api/documents/:userId/reject
// @access  Private/Admin
exports.rejectDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndUpdate(
      { userId: req.params.userId },
      { status: 'rejected' },
      { new: true }
    );
    await User.findByIdAndUpdate(req.params.userId, { verificationStatus: 'rejected' });

    // 🔔 إشعار للمستخدم
    try {
      await Notification.create({
        userId: req.params.userId,
        type: 'document_rejected',
        title: '❌ تم رفض وثائقك',
        message: req.body.reason || 'للأسف، تم رفض وثائقك. يرجى مراجعة الإدارة للمزيد من المعلومات.'
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار الرفض:', notifError);
    }

    res.json({ success: true, message: 'تم الرفض' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};