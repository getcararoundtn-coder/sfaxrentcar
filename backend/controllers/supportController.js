const SupportMessage = require('../models/SupportMessage');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    إرسال رسالة دعم جديدة
// @route   POST /api/support
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'الموضوع والرسالة مطلوبان' });
    }

    const supportMessage = await SupportMessage.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      subject,
      message,
      status: 'open',
      isRead: false
    });

    // إشعار للمشرفين
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          type: 'support_new',
          title: '📩 رسالة دعم جديدة',
          message: `رسالة جديدة من ${req.user.name}: ${subject.substring(0, 50)}...`,
          relatedId: supportMessage._id
        });
      }
    } catch (notifError) {
      console.error('فشل إنشاء إشعار للمشرفين:', notifError);
    }

    res.status(201).json({
      success: true,
      data: supportMessage,
      message: 'تم إرسال رسالتك بنجاح'
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب رسائل الدعم (للمشرف)
// @route   GET /api/admin/support/messages
// @access  Private/Admin
exports.getSupportMessages = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await SupportMessage.find(query)
      .populate('userId', 'name email')
      .populate('adminReply.repliedBy', 'name')
      .sort({ status: 1, priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupportMessage.countDocuments(query);

    // تحديث حالة القراءة (للمشرف)
    await SupportMessage.updateMany(
      { isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getSupportMessages:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب رسالة دعم واحدة
// @route   GET /api/admin/support/messages/:id
// @access  Private/Admin
exports.getSupportMessageById = async (req, res) => {
  try {
    const message = await SupportMessage.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('adminReply.repliedBy', 'name email');

    if (!message) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    // تحديث حالة القراءة
    if (!message.isRead) {
      message.isRead = true;
      await message.save();
    }

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error in getSupportMessageById:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    الرد على رسالة دعم
// @route   POST /api/admin/support/messages/:id/reply
// @access  Private/Admin
exports.replyToSupport = async (req, res) => {
  try {
    const { reply } = req.body;
    const messageId = req.params.id;

    if (!reply) {
      return res.status(400).json({ message: 'نص الرد مطلوب' });
    }

    const message = await SupportMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    message.adminReply = {
      text: reply,
      repliedBy: req.user._id,
      repliedAt: new Date()
    };
    message.status = 'closed';
    message.updatedAt = new Date();

    await message.save();

    // إشعار للمستخدم
    try {
      await Notification.create({
        userId: message.userId,
        type: 'support_reply',
        title: '📨 تم الرد على رسالتك',
        message: `تم الرد على طلب الدعم الخاص بك: "${message.subject}"`,
        relatedId: message._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار الرد:', notifError);
    }

    res.json({
      success: true,
      data: message,
      message: 'تم إرسال الرد بنجاح'
    });
  } catch (error) {
    console.error('Error in replyToSupport:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    تحديث حالة الرسالة
// @route   PATCH /api/admin/support/messages/:id/status
// @access  Private/Admin
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const messageId = req.params.id;

    if (!['open', 'pending', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'حالة غير صالحة' });
    }

    const message = await SupportMessage.findByIdAndUpdate(
      messageId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error in updateMessageStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    حذف رسالة دعم
// @route   DELETE /api/admin/support/messages/:id
// @access  Private/Admin
exports.deleteSupportMessage = async (req, res) => {
  try {
    const message = await SupportMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }
    res.json({ success: true, message: 'تم حذف الرسالة' });
  } catch (error) {
    console.error('Error in deleteSupportMessage:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    إحصائيات رسائل الدعم
// @route   GET /api/admin/support/stats
// @access  Private/Admin
exports.getSupportStats = async (req, res) => {
  try {
    const [total, open, pending, closed, unread] = await Promise.all([
      SupportMessage.countDocuments(),
      SupportMessage.countDocuments({ status: 'open' }),
      SupportMessage.countDocuments({ status: 'pending' }),
      SupportMessage.countDocuments({ status: 'closed' }),
      SupportMessage.countDocuments({ isRead: false })
    ]);

    res.json({
      success: true,
      data: { total, open, pending, closed, unread }
    });
  } catch (error) {
    console.error('Error in getSupportStats:', error);
    res.status(500).json({ message: error.message });
  }
};