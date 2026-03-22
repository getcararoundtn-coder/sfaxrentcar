const mongoose = require('mongoose');
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Document = require('../models/Document');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');

// دالة مساعدة للتحقق من صحة ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==================== الإحصائيات ====================

// إحصائيات أساسية
exports.getStats = async (req, res) => {
  try {
    const [usersCount, carsCount, bookingsCount, pendingVerifications] = await Promise.all([
      User.countDocuments(),
      Car.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments({ verificationStatus: 'pending' })
    ]);

    res.json({
      success: true,
      data: { usersCount, carsCount, bookingsCount, pendingVerifications }
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الإحصائيات' });
  }
};

// إحصائيات متقدمة
exports.getAdvancedStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verificationStatus: 'approved' });
    const pendingUsers = await User.countDocuments({ verificationStatus: 'pending' });
    const rejectedUsers = await User.countDocuments({ verificationStatus: 'rejected' });
    
    const totalCars = await Car.countDocuments();
    const availableCars = await Car.countDocuments({ status: 'approved' });
    const pendingCars = await Car.countDocuments({ status: 'pending' });
    
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const activeBookings = await Booking.countDocuments({ status: 'approved' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // إجمالي الإيرادات
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // إيرادات آخر 30 يوم
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const monthlyRevenueResult = await Booking.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: last30Days } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

    // حجوزات آخر 30 يوم
    const monthlyBookings = await Booking.countDocuments({ createdAt: { $gte: last30Days } });
    
    // مستخدمين جدد آخر 30 يوم
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: last30Days } });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          pending: pendingUsers,
          rejected: rejectedUsers,
          newThisMonth: newUsersThisMonth
        },
        cars: {
          total: totalCars,
          available: availableCars,
          pending: pendingCars
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          active: activeBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          monthly: monthlyBookings
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue
        }
      }
    });
  } catch (error) {
    console.error('Error in getAdvancedStats:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الإحصائيات المتقدمة' });
  }
};

// ==================== طلبات التحقق ====================

exports.getPendingVerifications = async (req, res) => {
  try {
    const documents = await Document.find({ status: 'pending' })
      .populate('userId', 'name email phone');
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error in getPendingVerifications:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب طلبات التحقق' });
  }
};

exports.approveVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'معرف مستخدم غير صالح' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    await User.findByIdAndUpdate(userId, { verificationStatus: 'approved' });
    await Document.findOneAndUpdate({ userId }, { status: 'approved' });
    
    // إنشاء إشعار للمستخدم
    try {
      await Notification.create({
        userId,
        type: 'document_verified',
        title: 'تم توثيق حسابك',
        message: 'تمت الموافقة على وثائقك بنجاح، يمكنك الآن استخدام جميع خدمات المنصة.'
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار التوثيق:', notifError);
    }

    res.json({ success: true, message: 'تم قبول التحقق' });
  } catch (error) {
    console.error('Error in approveVerification:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء قبول التحقق' });
  }
};

exports.rejectVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'معرف مستخدم غير صالح' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    await User.findByIdAndUpdate(userId, { verificationStatus: 'rejected' });
    await Document.findOneAndUpdate({ userId }, { status: 'rejected' });
    
    // إنشاء إشعار للمستخدم مع سبب الرفض
    try {
      await Notification.create({
        userId,
        type: 'document_rejected',
        title: 'تم رفض وثائقك',
        message: reason || 'للأسف، تم رفض وثائقك. يرجى مراجعة الإدارة للمزيد من المعلومات.'
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار الرفض:', notifError);
    }

    res.json({ success: true, message: 'تم رفض التحقق' });
  } catch (error) {
    console.error('Error in rejectVerification:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء رفض التحقق' });
  }
};

// ==================== المستخدمين ====================

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب المستخدمين' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'معرف مستخدم غير صالح' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب المستخدم' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'معرف مستخدم غير صالح' });
    }

    if (!['user', 'company', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'دور غير صالح' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    res.status(500).json({ message: 'حدث خطأ في تحديث دور المستخدم' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'معرف مستخدم غير صالح' });
    }

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'حالة غير صالحة' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error in toggleUserStatus:', error);
    res.status(500).json({ message: 'حدث خطأ في تغيير حالة المستخدم' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'معرف مستخدم غير صالح' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    
    // حذف جميع البيانات المرتبطة بالمستخدم
    await Promise.all([
      Car.deleteMany({ ownerId: id }),
      Booking.deleteMany({ renterId: id }),
      Document.deleteMany({ userId: id }),
      Message.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] }),
      Notification.deleteMany({ userId: id })
    ]);
    
    await User.findByIdAndDelete(id);
    
    res.json({ success: true, message: 'تم حذف المستخدم وجميع بياناته' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'حدث خطأ في حذف المستخدم' });
  }
};

// ==================== السيارات ====================

exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find()
      .populate('ownerId', 'name email phone')
      .sort('-createdAt');
    
    res.json({ success: true, data: cars });
  } catch (error) {
    console.error('Error in admin getAllCars:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب جميع السيارات' });
  }
};

exports.getPendingCars = async (req, res) => {
  try {
    const cars = await Car.find({ status: 'pending' })
      .populate('ownerId', 'name email phone')
      .sort('-createdAt');
    
    res.json({ success: true, data: cars });
  } catch (error) {
    console.error('Error in admin getPendingCars:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب السيارات المعلقة' });
  }
};

exports.approveCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('ownerId');

    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    // إشعار للمالك
    try {
      await Notification.create({
        userId: car.ownerId._id,
        type: 'car_approved',
        title: '🚗✅ تمت الموافقة على سيارتك',
        message: `سيارتك ${car.brand} ${car.model} أصبحت متاحة الآن للحجز.`,
        relatedId: car._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار الموافقة على السيارة:', notifError);
    }

    res.json({ success: true, data: car });
  } catch (error) {
    console.error('Error in admin approveCar:', error);
    res.status(500).json({ message: 'حدث خطأ في الموافقة على السيارة' });
  }
};

exports.rejectCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('ownerId');

    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    // إشعار للمالك
    try {
      await Notification.create({
        userId: car.ownerId._id,
        type: 'car_rejected',
        title: '🚗❌ تم رفض سيارتك',
        message: `للأسف، تم رفض سيارتك ${car.brand} ${car.model}. يرجى مراجعة الإدارة للمزيد من المعلومات.`,
        relatedId: car._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار الرفض:', notifError);
    }

    res.json({ success: true, data: car });
  } catch (error) {
    console.error('Error in admin rejectCar:', error);
    res.status(500).json({ message: 'حدث خطأ في رفض السيارة' });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }
    
    res.json({ success: true, data: car });
  } catch (error) {
    console.error('Error in admin updateCar:', error);
    res.status(500).json({ message: 'حدث خطأ في تحديث السيارة' });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }
    
    res.json({ success: true, message: 'تم حذف السيارة' });
  } catch (error) {
    console.error('Error in admin deleteCar:', error);
    res.status(500).json({ message: 'حدث خطأ في حذف السيارة' });
  }
};

// ==================== السيارات المميزة ====================

// @desc    تفعيل/إلغاء تفعيل السيارة المميزة
// @route   PATCH /api/admin/cars/:id/featured
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured, durationDays } = req.body;

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    car.isFeatured = isFeatured !== undefined ? isFeatured : !car.isFeatured;
    
    // إذا تم تفعيل المميزة، قم بتعيين تاريخ الانتهاء
    if (car.isFeatured && durationDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);
      car.featuredExpiresAt = expiresAt;
    } else if (!car.isFeatured) {
      car.featuredExpiresAt = null;
    }

    await car.save();

    // إشعار للمالك
    try {
      await Notification.create({
        userId: car.ownerId,
        type: car.isFeatured ? 'car_featured' : 'car_unfeatured',
        title: car.isFeatured ? '⭐ تم تمييز سيارتك' : '☆ تم إلغاء تمييز سيارتك',
        message: car.isFeatured 
          ? `سيارتك ${car.brand} ${car.model} أصبحت مميزة وستظهر أولاً في نتائج البحث.`
          : `تم إلغاء تمييز سيارتك ${car.brand} ${car.model}.`,
        relatedId: car._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار التميز:', notifError);
    }

    res.json({
      success: true,
      data: car,
      message: car.isFeatured ? '⭐ السيارة مميزة الآن' : '☆ تم إلغاء تمييز السيارة'
    });
  } catch (error) {
    console.error('❌ Error in toggleFeatured:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== الحجوزات ====================

exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .populate({
        path: 'carId',
        populate: { path: 'ownerId', select: 'name email phone' }
      })
      .populate('renterId', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error in admin getPendingBookings:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الحجوزات المعلقة' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'carId',
        populate: { path: 'ownerId', select: 'name email phone' }
      })
      .populate('renterId', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error in admin getAllBookings:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب جميع الحجوزات' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'carId',
        populate: { path: 'ownerId', select: 'name email phone' }
      })
      .populate('renterId', 'name email phone');
    
    if (!booking) return res.status(404).json({ message: 'الحجز غير موجود' });
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error in admin getBookingById:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الحجز' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'حالة غير صالحة' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('carId').populate('renterId');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    let title, message;
    switch (status) {
      case 'approved':
        title = '✅ تم تأكيد حجزك';
        message = `تم تأكيد حجزك لسيارة ${booking.carId.brand} ${booking.carId.model}`;
        break;
      case 'rejected':
        title = '❌ تم رفض حجزك';
        message = `تم رفض حجزك لسيارة ${booking.carId.brand} ${booking.carId.model}`;
        break;
      case 'completed':
        title = '✅ اكتمل حجزك';
        message = `تم اكتمال حجزك لسيارة ${booking.carId.brand} ${booking.carId.model}`;
        break;
      case 'cancelled':
        title = '❌ تم إلغاء حجزك';
        message = `تم إلغاء حجزك لسيارة ${booking.carId.brand} ${booking.carId.model}`;
        break;
      default:
        title = 'تم تحديث حالة حجزك';
        message = `حالة حجزك أصبحت: ${status}`;
    }

    // إشعار للمستأجر
    try {
      await Notification.create({
        userId: booking.renterId._id,
        type: `booking_${status}`,
        title,
        message,
        relatedId: booking._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار:', notifError);
    }

    // إشعار للمؤجر في حالة الاكتمال أو الإلغاء
    if (status === 'completed' || status === 'cancelled') {
      try {
        await Notification.create({
          userId: booking.carId.ownerId,
          type: `booking_${status}`,
          title: status === 'completed' ? '✅ اكتمال حجز سيارتك' : '❌ إلغاء حجز سيارتك',
          message: status === 'completed' 
            ? `تم اكتمال حجز سيارتك ${booking.carId.brand} ${booking.carId.model}`
            : `تم إلغاء حجز سيارتك ${booking.carId.brand} ${booking.carId.model}`,
          relatedId: booking._id
        });
      } catch (notifError) {
        console.error('فشل إنشاء إشعار للمؤجر:', notifError);
      }
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error in admin updateBookingStatus:', error);
    res.status(500).json({ message: 'حدث خطأ في تحديث حالة الحجز' });
  }
};

// ==================== الوثائق ====================

exports.getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find()
      .populate('userId', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, data: docs });
  } catch (error) {
    console.error('Error in admin getAllDocuments:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الوثائق' });
  }
};

exports.getPendingDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ status: 'pending' })
      .populate('userId', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, data: docs });
  } catch (error) {
    console.error('Error in admin getPendingDocuments:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الوثائق المعلقة' });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('userId', 'name email phone');
    if (!doc) return res.status(404).json({ message: 'الوثيقة غير موجودة' });
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Error in admin getDocumentById:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الوثيقة' });
  }
};

exports.approveDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'الوثيقة غير موجودة' });
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Error in admin approveDocument:', error);
    res.status(500).json({ message: 'حدث خطأ في قبول الوثيقة' });
  }
};

exports.rejectDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'الوثيقة غير موجودة' });
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Error in admin rejectDocument:', error);
    res.status(500).json({ message: 'حدث خطأ في رفض الوثيقة' });
  }
};

// @desc    حذف وثيقة (مسح نهائي)
// @route   DELETE /api/admin/documents/:id
// @access  Private/Admin
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'الوثيقة غير موجودة' });
    }
    res.json({ success: true, message: 'تم مسح الوثائق بنجاح' });
  } catch (error) {
    console.error('❌ Error in deleteDocument:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== الرسائل ====================

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .populate('bookingId', 'carId')
      .sort('-createdAt');
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error in admin getAllMessages:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الرسائل' });
  }
};

exports.getUnreadMessages = async (req, res) => {
  try {
    const messages = await Message.find({ read: false })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort('-createdAt');
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error in admin getUnreadMessages:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الرسائل غير المقروءة' });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .populate('bookingId');
    if (!message) return res.status(404).json({ message: 'الرسالة غير موجودة' });
    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error in admin getMessageById:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الرسالة' });
  }
};

exports.replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ message: 'نص الرد مطلوب' });

    const originalMessage = await Message.findById(req.params.id);
    if (!originalMessage) return res.status(404).json({ message: 'الرسالة غير موجودة' });

    // إنشاء رسالة جديدة كرد
    const newMessage = await Message.create({
      bookingId: originalMessage.bookingId,
      senderId: req.user._id,
      receiverId: originalMessage.senderId,
      text: reply,
      reply: true,
      read: false
    });

    // إشعار للمستخدم
    try {
      await Notification.create({
        userId: originalMessage.senderId,
        type: 'message_reply',
        title: '📨 تم الرد على رسالتك',
        message: `تم الرد على رسالتك: ${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}`,
        relatedId: newMessage._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار الرد:', notifError);
    }

    res.json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Error in admin replyToMessage:', error);
    res.status(500).json({ message: 'حدث خطأ في الرد على الرسالة' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'الرسالة غير موجودة' });
    res.json({ success: true, message: 'تم حذف الرسالة' });
  } catch (error) {
    console.error('Error in admin deleteMessage:', error);
    res.status(500).json({ message: 'حدث خطأ في حذف الرسالة' });
  }
};

// ==================== التقارير ====================

exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;
    
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    let data = {};
    
    switch(type) {
      case 'users':
        data = await User.find({
          createdAt: { $gte: start, $lte: end }
        }).select('-password');
        break;
        
      case 'cars':
        data = await Car.find({ createdAt: { $gte: start, $lte: end } })
          .populate('ownerId', 'name email');
        break;
        
      case 'bookings':
        data = await Booking.find({ createdAt: { $gte: start, $lte: end } })
          .populate({
            path: 'carId',
            populate: { path: 'ownerId', select: 'name' }
          })
          .populate('renterId', 'name');
        break;
        
      case 'revenue':
        data = await Booking.aggregate([
          { $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } },
          { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$totalPrice' },
            count: { $sum: 1 }
          }},
          { $sort: { _id: 1 } }
        ]);
        break;
        
      case 'summary':
        const [
          totalUsers,
          newUsers,
          totalCars,
          newCars,
          totalBookings,
          newBookings,
          totalRevenueResult,
          periodRevenueResult
        ] = await Promise.all([
          User.countDocuments(),
          User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Car.countDocuments(),
          Car.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Booking.countDocuments(),
          Booking.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Booking.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
          Booking.aggregate([{ $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }])
        ]);
        
        data = {
          period: { start, end },
          totals: {
            users: totalUsers,
            cars: totalCars,
            bookings: totalBookings,
            revenue: totalRevenueResult[0]?.total || 0
          },
          periodStats: {
            newUsers,
            newCars,
            newBookings,
            revenue: periodRevenueResult[0]?.total || 0
          }
        };
        break;
        
      default:
        return res.status(400).json({ message: 'نوع تقرير غير صالح' });
    }

    res.json({ success: true, data: { type, period: { start, end }, data } });
  } catch (error) {
    console.error('Error in generateReport:', error);
    res.status(500).json({ message: 'حدث خطأ في إنشاء التقرير' });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { type } = req.params;
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error in getReport:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب التقرير' });
  }
};