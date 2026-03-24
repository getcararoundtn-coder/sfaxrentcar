const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const Review = require('../models/Review');

// @desc    إنشاء حجز جديد
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate, totalPrice } = req.body;

    if (!totalPrice || isNaN(totalPrice) || totalPrice <= 0) {
      return res.status(400).json({ message: 'السعر الإجمالي مطلوب أو غير صالح' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'تاريخ البداية والنهاية مطلوبان' });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    if (car.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'لا يمكنك حجز سيارتك الخاصة' });
    }

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

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' });
    }

    const settings = await Setting.findOne();
    const commissionRate = settings?.commissionRate || 0;
    const platformCommission = (totalPrice * commissionRate) / 100;

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

    try {
      await Notification.create({
        userId: car.ownerId,
        type: 'booking_pending',
        title: '📅 حجز جديد بانتظار الموافقة',
        message: `لديك حجز جديد على سيارتك ${car.brand} ${car.model} لمدة ${days} أيام`,
        relatedId: booking._id,
        relatedModel: 'Booking'
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار للمالك:', notifError);
    }

    try {
      await Notification.create({
        userId: req.user._id,
        type: 'booking_created',
        title: '📅 تم إنشاء حجزك',
        message: `تم إنشاء حجزك لسيارة ${car.brand} ${car.model} بنجاح. في انتظار موافقة المالك.`,
        relatedId: booking._id,
        relatedModel: 'Booking'
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
      .populate('ownerId', 'first_name last_name email phone')
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
      .populate('renterId', 'first_name last_name email phone')
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

    const booking = await Booking.findById(bookingId)
      .populate('carId', 'brand model ownerId images')
      .populate('renterId', 'first_name last_name email');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذا الحجز' });
    }

    booking.status = status;
    await booking.save();

    let title = '';
    let notificationMessage = '';
    let notificationType = '';

    switch (status) {
      case 'accepted':
        notificationType = 'booking_accepted';
        title = '✅ Réservation confirmée';
        notificationMessage = `Votre réservation pour ${booking.carId.brand} ${booking.carId.model} a été acceptée. Vous pouvez maintenant contacter le propriétaire via la section "Messages".`;
        break;
      case 'refused':
        notificationType = 'booking_refused';
        title = '❌ Réservation refusée';
        notificationMessage = `Votre réservation pour ${booking.carId.brand} ${booking.carId.model} a été refusée.`;
        break;
      case 'cancelled':
        notificationType = 'booking_cancelled';
        title = '⚠️ Réservation annulée';
        notificationMessage = `Votre réservation pour ${booking.carId.brand} ${booking.carId.model} a été annulée.`;
        break;
      default:
        notificationType = 'booking_status';
        title = '📅 Mise à jour de réservation';
        notificationMessage = `Le statut de votre réservation pour ${booking.carId.brand} ${booking.carId.model} a changé.`;
    }

    try {
      await Notification.create({
        userId: booking.renterId._id,
        type: notificationType,
        title,
        message: notificationMessage,
        relatedId: booking._id,
        relatedModel: 'Booking'
      });
      console.log(`✅ Notification sent to renter: ${notificationType}`);
    } catch (notifError) {
      console.error('❌ Failed to create notification:', notifError);
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
    const booking = await Booking.findById(req.params.id)
      .populate('carId', 'brand model ownerId');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    if (booking.renterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بإلغاء هذا الحجز' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'لا يمكن إلغاء هذا الحجز' });
    }

    booking.status = 'cancelled';
    await booking.save();

    try {
      await Notification.create({
        userId: booking.ownerId,
        type: 'booking_cancelled',
        title: '⚠️ Réservation annulée',
        message: `La réservation de votre ${booking.carId.brand} ${booking.carId.model} a été annulée par le locataire.`,
        relatedId: booking._id,
        relatedModel: 'Booking'
      });
    } catch (notifError) {
      console.error('❌ Failed to create notification:', notifError);
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
    const booking = await Booking.findById(req.params.id)
      .populate('carId', 'brand model ownerId');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بإكمال هذا الحجز' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'لا يمكن إكمال هذا الحجز' });
    }

    booking.status = 'completed';
    await booking.save();

    try {
      await Notification.create({
        userId: booking.renterId,
        type: 'booking_completed',
        title: '✅ Réservation terminée',
        message: `La réservation de votre ${booking.carId.brand} ${booking.carId.model} est terminée. Merci d'avoir utilisé DriveTunisia !`,
        relatedId: booking._id,
        relatedModel: 'Booking'
      });
    } catch (notifError) {
      console.error('❌ Failed to create notification:', notifError);
    }

    try {
      await Notification.create({
        userId: booking.renterId,
        type: 'new_review',
        title: '⭐ Évaluez votre expérience',
        message: `Comment s'est passée votre location avec ${booking.carId.brand} ${booking.carId.model} ? Donnez votre avis sur le propriétaire.`,
        relatedId: booking._id,
        relatedModel: 'Booking'
      });
    } catch (notifError) {
      console.error('❌ Failed to create review notification:', notifError);
    }

    res.json({ success: true, message: 'تم إكمال الحجز بنجاح' });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    تقييم المؤجر بعد انتهاء الحجز
// @route   POST /api/bookings/:id/review-owner
// @access  Private (المستأجر فقط)
exports.reviewOwner = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate('carId', 'brand model ownerId')
      .populate('ownerId', 'first_name last_name');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    if (booking.renterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بتقييم هذا الحجز' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'لا يمكن تقييم الحجز إلا بعد اكتماله' });
    }

    const existingReview = await Review.findOne({ bookingId, type: 'owner' });
    if (existingReview) {
      return res.status(400).json({ message: 'تم تقييم هذا الحجز مسبقاً' });
    }

    const review = await Review.create({
      type: 'owner',
      bookingId: booking._id,
      reviewerId: req.user._id,
      reviewedUserId: booking.ownerId._id,
      ownerId: booking.ownerId._id,
      rating,
      comment
    });

    const owner = await User.findById(booking.ownerId._id);
    const newRatingSum = (owner.ownerRating * owner.ownerRatingCount) + rating;
    const newRatingCount = owner.ownerRatingCount + 1;
    const newAverageRating = newRatingSum / newRatingCount;

    await User.findByIdAndUpdate(booking.ownerId._id, {
      ownerRating: newAverageRating,
      ownerRatingCount: newRatingCount
    });

    res.json({ success: true, data: review, message: 'تم تقييم المؤجر بنجاح' });
  } catch (error) {
    console.error('Error in reviewOwner:', error);
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
      .populate('renterId', 'first_name last_name email phone')
      .populate('ownerId', 'first_name last_name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

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