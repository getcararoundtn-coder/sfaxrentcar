const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc إرسال رسالة
// @route POST /api/messages
// @access Private
exports.sendMessage = async (req, res) => {
  try {
    const { bookingId, text } = req.body;
    const senderId = req.user._id;

    console.log('📨 Sending message:', { bookingId, text, senderId });

    const booking = await Booking.findById(bookingId)
      .populate('carId')
      .populate('renterId');
    
    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    if (booking.status !== 'approved') {
      return res.status(403).json({ message: 'لا يمكن إرسال رسائل لحجز غير موافق عليه' });
    }

    const car = booking.carId;
    const ownerId = car.ownerId;
    
    let receiverId;
    let receiverRole = '';
    
    if (senderId.toString() === booking.renterId._id.toString()) {
      receiverId = ownerId;
      receiverRole = 'owner';
    } else if (senderId.toString() === ownerId.toString()) {
      receiverId = booking.renterId._id;
      receiverRole = 'renter';
    } else {
      return res.status(403).json({ message: 'غير مصرح لك بإرسال رسائل لهذا الحجز' });
    }

    const message = await Message.create({
      bookingId,
      senderId,
      receiverId,
      text,
      read: false
    });

    const sender = await User.findById(senderId).select('name');
    
    let notificationTitle = '';
    let notificationMessage = '';
    
    if (receiverRole === 'owner') {
      notificationTitle = '💬 رسالة جديدة من المستأجر';
      notificationMessage = `لديك رسالة جديدة من المستأجر ${sender.name} بخصوص حجز سيارتك`;
    } else {
      notificationTitle = '💬 رسالة جديدة من المالك';
      notificationMessage = `لديك رسالة جديدة من المالك ${sender.name} بخصوص حجزك`;
    }

    try {
      await Notification.create({
        userId: receiverId,
        type: 'new_message',
        title: notificationTitle,
        message: notificationMessage,
        relatedId: bookingId
      });
      console.log('✅ Notification sent to receiver');
    } catch (notifError) {
      console.error('❌ Failed to create notification:', notifError);
    }

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name');

    res.status(201).json({ success: true, data: populatedMessage });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ 
      success: false,
      message: 'حدث خطأ في إرسال الرسالة',
      error: error.message 
    });
  }
};

// @desc جلب رسائل حجز معين
// @route GET /api/messages/:bookingId
// @access Private
exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId).populate('carId');
    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    const car = booking.carId;
    const ownerId = car.ownerId;

    if (userId.toString() !== booking.renterId.toString() && 
        userId.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بمشاهدة هذه الرسائل' });
    }

    const messages = await Message.find({ bookingId })
      .populate('senderId', 'name')
      .sort('createdAt');

    // تحديث حالة الرسائل كمقروءة للمستلم
    await Message.updateMany(
      { bookingId, receiverId: userId, read: false },
      { read: true }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc جلب جميع رسائل المستخدم (لصفحة الرسائل)
// @route GET /api/messages/my-messages
// @access Private
exports.getMyMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'carId',
          select: 'brand model images'
        }
      })
      .sort('-createdAt');
    
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('❌ Error getting my messages:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc الحصول على عدد الرسائل غير المقروءة
// @route GET /api/messages/unread-count
// @access Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Message.countDocuments({ receiverId: userId, read: false });
    res.json({ success: true, data: count });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc الحصول على جميع المحادثات للمستخدم
// @route GET /api/messages/conversations
// @access Private
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$bookingId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $lookup: {
          from: 'cars',
          localField: 'booking.carId',
          foreignField: '_id',
          as: 'car'
        }
      },
      { $unwind: '$car' },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc الرد على رسالة (للمشرفين)
// @route POST /api/messages/:id/reply
// @access Private/Admin
exports.replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    const originalMessage = await Message.findById(req.params.id)
      .populate('senderId', 'name email');

    if (!originalMessage) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    const newMessage = await Message.create({
      bookingId: originalMessage.bookingId,
      senderId: req.user._id,
      receiverId: originalMessage.senderId._id,
      text: reply,
      reply: true,
      read: false
    });

    try {
      await Notification.create({
        userId: originalMessage.senderId._id,
        type: 'message_reply',
        title: '📨 رد على رسالتك',
        message: `تم الرد على استفسارك: ${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}`,
        relatedId: newMessage._id
      });
    } catch (notifError) {
      console.error('❌ Failed to create notification:', notifError);
    }

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error('❌ Error replying to message:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc تحديث حالة الرسالة إلى مقروءة
// @route PATCH /api/messages/:id/read
// @access Private
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json({ success: true, data: message });
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc حذف رسالة (للمشرف أو المرسل)
// @route DELETE /api/messages/:id
// @access Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'الرسالة غير موجودة' });
    }

    // التحقق من الصلاحية: المشرف أو المرسل
    if (req.user.role !== 'admin' && message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذه الرسالة' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف الرسالة' });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({ message: error.message });
  }
};