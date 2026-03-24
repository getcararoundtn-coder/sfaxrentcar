const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc إرسال رسالة
// @route POST /api/messages/booking/:bookingId
// @access Private
exports.sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    console.log('📨 Sending message:', { bookingId, message, senderId });

    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Le message ne peut pas être vide' 
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate('carId')
      .populate('renterId', 'first_name last_name')
      .populate('ownerId', 'first_name last_name');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Réservation non trouvée' 
      });
    }

    const allowedStatuses = ['accepted', 'approved', 'ongoing', 'completed'];
    if (!allowedStatuses.includes(booking.status)) {
      return res.status(403).json({ 
        success: false,
        message: 'La conversation n\'est disponible qu\'après confirmation de la réservation' 
      });
    }

    const car = booking.carId;
    const ownerId = booking.ownerId._id || booking.ownerId;
    
    let receiverId;
    let receiverRole = '';
    
    if (senderId.toString() === booking.renterId._id.toString()) {
      receiverId = ownerId;
      receiverRole = 'owner';
    } else if (senderId.toString() === ownerId.toString()) {
      receiverId = booking.renterId._id;
      receiverRole = 'renter';
    } else {
      return res.status(403).json({ 
        success: false,
        message: 'Vous n\'êtes pas autorisé à envoyer des messages pour cette réservation' 
      });
    }

    const newMessage = await Message.create({
      bookingId,
      carId: car._id,
      senderId,
      receiverId,
      message: message.trim(),
      text: message.trim(), // ✅ حفظ أيضاً في حقل text للتوافق
      isRead: false,
      readAt: null
    });

    const sender = await User.findById(senderId).select('first_name last_name');
    
    let notificationTitle = '';
    let notificationMessage = '';
    
    if (receiverRole === 'owner') {
      notificationTitle = '💬 Nouveau message du locataire';
      notificationMessage = `Vous avez reçu un nouveau message de ${sender.first_name} ${sender.last_name} concernant la réservation de votre ${car.brand} ${car.model}`;
    } else {
      notificationTitle = '💬 Nouveau message du propriétaire';
      notificationMessage = `Vous avez reçu un nouveau message de ${sender.first_name} ${sender.last_name} concernant votre réservation pour ${car.brand} ${car.model}`;
    }

    try {
      await Notification.create({
        userId: receiverId,
        type: 'new_message',
        title: notificationTitle,
        message: notificationMessage,
        relatedId: bookingId,
        relatedModel: 'Booking'
      });
      console.log('✅ Notification sent to receiver');
    } catch (notifError) {
      console.error('❌ Failed to create notification:', notifError);
    }

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'first_name last_name');

    res.status(201).json({ success: true, data: populatedMessage });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message 
    });
  }
};

// @desc جلب رسائل حجز معين
// @route GET /api/messages/booking/:bookingId
// @access Private
exports.getMessagesByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    console.log('📨 Fetching messages for booking:', bookingId);
    console.log('👤 User ID:', userId);

    const booking = await Booking.findById(bookingId)
      .populate('carId', 'brand model images ownerId')
      .populate('renterId', 'first_name last_name')
      .populate('ownerId', 'first_name last_name');
      
    if (!booking) {
      console.log('❌ Booking not found:', bookingId);
      return res.status(404).json({ 
        success: false,
        message: 'Réservation non trouvée' 
      });
    }

    console.log('📋 Booking found:', {
      id: booking._id,
      status: booking.status,
      renterId: booking.renterId?._id,
      ownerId: booking.ownerId?._id
    });

    const allowedStatuses = ['accepted', 'approved', 'ongoing', 'completed'];
    if (!allowedStatuses.includes(booking.status)) {
      console.log('❌ Booking not accepted, status:', booking.status);
      return res.status(403).json({ 
        success: false,
        message: 'La conversation n\'est disponible qu\'après confirmation de la réservation',
        canChat: false,
        bookingStatus: booking.status
      });
    }

    const car = booking.carId;
    const ownerId = booking.ownerId?._id || booking.ownerId;

    const isRenter = userId.toString() === booking.renterId?._id?.toString();
    const isOwner = userId.toString() === ownerId?.toString();
    
    if (!isRenter && !isOwner) {
      console.log('❌ User not authorized:', userId);
      return res.status(403).json({ 
        success: false,
        message: 'Vous n\'êtes pas autorisé à voir ces messages' 
      });
    }

    const messages = await Message.find({ bookingId })
      .populate('senderId', 'first_name last_name')
      .populate('receiverId', 'first_name last_name')
      .sort('createdAt');

    console.log('✅ Found raw messages:', messages.length);

    // ✅ تحويل الرسائل للتأكد من وجود المحتوى
    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      message: msg.message || msg.text || '', // دعم message و text
      text: msg.text || msg.message || '',     // للتوافق
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      createdAt: msg.createdAt,
      isRead: msg.isRead,
      readAt: msg.readAt
    }));

    console.log('✅ Formatted messages:', formattedMessages.map(m => ({ id: m._id, content: m.message.substring(0, 50) })));

    // تحديث حالة الرسائل كمقروءة للمستلم
    await Message.updateMany(
      { bookingId, receiverId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    let otherUserId = null;
    let otherUserName = 'Utilisateur';
    
    if (isRenter) {
      otherUserId = ownerId;
      if (booking.ownerId) {
        otherUserName = `${booking.ownerId.first_name || ''} ${booking.ownerId.last_name || ''}`.trim() || 'Propriétaire';
      }
    } else {
      otherUserId = booking.renterId?._id;
      if (booking.renterId) {
        otherUserName = `${booking.renterId.first_name || ''} ${booking.renterId.last_name || ''}`.trim() || 'Locataire';
      }
    }

    res.json({ 
      success: true, 
      data: {
        messages: formattedMessages,
        booking: {
          id: booking._id,
          status: booking.status,
          startDate: booking.startDate,
          endDate: booking.endDate,
          canChat: true
        },
        car: {
          id: car._id,
          name: `${car.brand} ${car.model}`,
          image: car.images?.[0] || null
        },
        otherUser: {
          id: otherUserId || '',
          name: otherUserName
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      stack: error.stack 
    });
  }
};

// @desc الحصول على جميع المحادثات للمستخدم
// @route GET /api/messages/conversations
// @access Private
exports.getMyConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log('📨 Fetching conversations for user:', userId);
    
    const bookings = await Booking.find({
      $or: [
        { renterId: userId },
        { ownerId: userId }
      ],
      status: { $in: ['accepted', 'approved', 'ongoing', 'completed'] }
    })
      .populate('carId', 'brand model images')
      .populate('renterId', 'first_name last_name')
      .populate('ownerId', 'first_name last_name')
      .sort({ updatedAt: -1 });

    console.log('📋 Found bookings:', bookings.length);

    const conversations = await Promise.all(bookings.map(async (booking) => {
      const lastMessage = await Message.findOne({ bookingId: booking._id })
        .sort({ createdAt: -1 })
        .populate('senderId', 'first_name last_name');
      
      const unreadCount = await Message.countDocuments({
        bookingId: booking._id,
        receiverId: userId,
        isRead: false
      });

      let otherUserName = 'Utilisateur';
      let otherUserId = null;
      
      if (userId.toString() === booking.renterId?._id?.toString()) {
        otherUserId = booking.ownerId?._id;
        if (booking.ownerId) {
          otherUserName = `${booking.ownerId.first_name || ''} ${booking.ownerId.last_name || ''}`.trim() || 'Propriétaire';
        }
      } else {
        otherUserId = booking.renterId?._id;
        if (booking.renterId) {
          otherUserName = `${booking.renterId.first_name || ''} ${booking.renterId.last_name || ''}`.trim() || 'Locataire';
        }
      }

      // ✅ استخراج محتوى الرسالة بشكل صحيح
      let lastMessageText = null;
      if (lastMessage) {
        lastMessageText = lastMessage.message || lastMessage.text || '';
      }

      return {
        bookingId: booking._id,
        carName: `${booking.carId.brand} ${booking.carId.model}`,
        carImage: booking.carId.images?.[0] || null,
        otherUser: {
          id: otherUserId || '',
          name: otherUserName
        },
        lastMessage: lastMessage ? {
          text: lastMessageText,
          sender: lastMessage.senderId?.first_name || 'Utilisateur',
          createdAt: lastMessage.createdAt
        } : null,
        unreadCount,
        bookingStatus: booking.status,
        dates: {
          start: booking.startDate,
          end: booking.endDate
        }
      };
    }));

    console.log('✅ Returning conversations:', conversations.length);
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc الحصول على عدد الرسائل غير المقروءة
// @route GET /api/messages/unread-count
// @access Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Message.countDocuments({ 
      receiverId: userId, 
      isRead: false 
    });
    res.json({ success: true, data: count });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc تحديث حالة الرسالة إلى مقروءة
// @route PUT /api/messages/booking/:bookingId/read
// @access Private
exports.markAsRead = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const result = await Message.updateMany(
      { bookingId, receiverId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ 
      success: true, 
      data: { modifiedCount: result.modifiedCount },
      message: 'Messages marqués comme lus'
    });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc حذف رسالة (للمشرف أو المرسل)
// @route DELETE /api/messages/:id
// @access Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Message non trouvé' 
      });
    }

    if (req.user.role !== 'admin' && message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce message' 
      });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Message supprimé avec succès' 
    });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc الرد على رسالة (للمشرفين)
// @route POST /api/messages/:id/reply
// @access Private/Admin
exports.replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    const messageId = req.params.id;
    
    const originalMessage = await Message.findById(messageId)
      .populate('senderId', 'first_name last_name email');

    if (!originalMessage) {
      return res.status(404).json({ 
        success: false,
        message: 'Message non trouvé' 
      });
    }

    const newMessage = await Message.create({
      bookingId: originalMessage.bookingId,
      carId: originalMessage.carId,
      senderId: req.user._id,
      receiverId: originalMessage.senderId._id,
      message: reply,
      text: reply,
      isRead: false
    });

    try {
      await Notification.create({
        userId: originalMessage.senderId._id,
        type: 'message_reply',
        title: '📨 Réponse à votre message',
        message: `Une réponse a été apportée à votre message: ${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}`,
        relatedId: newMessage._id,
        relatedModel: 'Message'
      });
    } catch (notifError) {
      console.error('❌ Failed to create notification:', notifError);
    }

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'first_name last_name');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error('❌ Error replying to message:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};