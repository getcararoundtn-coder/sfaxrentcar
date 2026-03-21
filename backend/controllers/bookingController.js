const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');

// @desc    إنشاء حجز جديد
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate, totalPrice } = req.body;

    // التحقق من وجود totalPrice
    if (!totalPrice || isNaN(totalPrice) || totalPrice <= 0) {
      return res.status(400).json({ message: 'السعر الإجمالي مطلوب أو غير صالح' });
    }

    // التحقق من وجود التواريخ
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'تاريخ البداية والنهاية مطلوبان' });
    }

    // التحقق من وجود السيارة
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    // التحقق من أن المستخدم ليس مالك السيارة
    if (car.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'لا يمكنك حجز سيارتك الخاصة' });
    }

    // التحقق من توفر السيارة في التواريخ المطلوبة
    const existingBooking = await Booking.findOne({
      carId,
      status: { $in: ['pending', 'accepted'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'السيارة غير متاحة في هذه التواريخ' });
    }

    // حساب المدة بالأيام
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' });
    }

    // جلب إعدادات العمولة
    const settings = await Setting.findOne();
    const commissionRate = settings?.commissionRate || 0;
    const platformCommission = (totalPrice * commissionRate) / 100;

    // إنشاء الحجز
    const booking = await Booking.create({
      carId,
      renterId: req.user._id,
      ownerId: car.ownerId,
      startDate: start,
      endDate: end,
      durationDays: days,
      totalPrice: Number(totalPrice),
      platformCommission: Number(platformCommission),
      status: 'pending',
      paymentStatus: 'unpaid',
      hasReview: false,
      signed: false
    });

    // إشعار للمالك
    try {
      await Notification.create({
        userId: car.ownerId,
        type: 'booking_pending',
        title: '📅 حجز جديد بانتظار الموافقة',
        message: `لديك حجز جديد على سيارتك ${car.brand} ${car.model} لمدة ${days} أيام`,
        relatedId: booking._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار للمالك:', notifError);
    }

    // إشعار للمستأجر
    try {
      await Notification.create({
        userId: req.user._id,
        type: 'booking_created',
        title: '📅 تم إنشاء حجزك',
        message: `تم إنشاء حجزك لسيارة ${car.brand} ${car.model} بنجاح. في انتظار موافقة المالك.`,
        relatedId: booking._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار للمستأجر:', notifError);
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب حجوزات المستخدم الحالي (كمستأجر)
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renterId: req.user._id })
      .populate('carId', 'brand model images pricePerDay location')
      .populate('ownerId', 'name email phone')
      .sort('-createdAt');

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب حجوزات سيارات المستخدم (كمالك)
// @route   GET /api/bookings/owner-bookings
// @access  Private
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .populate('carId', 'brand model images pricePerDay location')
      .populate('renterId', 'name email phone')
      .sort('-createdAt');

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    تحديث حالة الحجز (قبول/رفض/إلغاء)
// @route   PATCH /api/bookings/:id/status
// @access  Private (مالك السيارة فقط)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId).populate('carId', 'brand model ownerId');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    // التحقق من أن المستخدم هو مالك السيارة
    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذا الحجز' });
    }

    booking.status = status;
    await booking.save();

    // إشعار للمستأجر
    let title = '';
    let message = '';
    switch (status) {
      case 'accepted':
        title = '✅ تم قبول حجزك';
        message = `تم قبول حجزك لسيارة ${booking.carId.brand} ${booking.carId.model}`;
        break;
      case 'refused':
        title = '❌ تم رفض حجزك';
        message = `تم رفض حجزك لسيارة ${booking.carId.brand} ${booking.carId.model}`;
        break;
      case 'cancelled':
        title = '⚠️ تم إلغاء حجزك';
        message = `تم إلغاء حجزك لسيارة ${booking.carId.brand} ${booking.carId.model}`;
        break;
      default:
        title = '📅 تحديث حالة الحجز';
        message = `تغيرت حالة حجزك لسيارة ${booking.carId.brand} ${booking.carId.model}`;
    }

    try {
      await Notification.create({
        userId: booking.renterId,
        type: 'booking_status',
        title,
        message,
        relatedId: booking._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار:', notifError);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    إلغاء حجز من قبل المستأجر
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (المستأجر فقط)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('carId', 'brand model ownerId');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    // التحقق من أن المستخدم هو المستأجر
    if (booking.renterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بإلغاء هذا الحجز' });
    }

    // لا يمكن إلغاء الحجز إذا كان مكتملاً أو ملغى سابقاً
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'لا يمكن إلغاء هذا الحجز' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // إشعار للمالك
    try {
      await Notification.create({
        userId: booking.ownerId,
        type: 'booking_cancelled',
        title: '⚠️ تم إلغاء حجز',
        message: `تم إلغاء حجز سيارتك ${booking.carId.brand} ${booking.carId.model} من قبل المستأجر`,
        relatedId: booking._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار:', notifError);
    }

    res.json({ success: true, message: 'تم إلغاء الحجز بنجاح' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    إنهاء الحجز (بعد استلام السيارة)
// @route   PATCH /api/bookings/:id/complete
// @access  Private (المالك فقط)
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('carId', 'brand model ownerId');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    // التحقق من أن المستخدم هو مالك السيارة
    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بإكمال هذا الحجز' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'لا يمكن إكمال هذا الحجز' });
    }

    booking.status = 'completed';
    await booking.save();

    // إشعار للمستأجر
    try {
      await Notification.create({
        userId: booking.renterId,
        type: 'booking_completed',
        title: '✅ اكتمل حجزك',
        message: `تم إكمال حجزك لسيارة ${booking.carId.brand} ${booking.carId.model}`,
        relatedId: booking._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار:', notifError);
    }

    res.json({ success: true, message: 'تم إكمال الحجز بنجاح' });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب تفاصيل حجز واحد
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('carId', 'brand model images pricePerDay location')
      .populate('renterId', 'name email phone')
      .populate('ownerId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    // التحقق من أن المستخدم هو المستأجر أو المالك أو مشرف
    if (booking.renterId._id.toString() !== req.user._id.toString() &&
        booking.ownerId._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك برؤية هذا الحجز' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: error.message });
  }
};