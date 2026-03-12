const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc إنشاء حجز جديد
// @route POST /api/bookings
// @access Private
exports.createBooking = async (req, res) => {
  try {
    console.log('📝 Creating new booking...');
    console.log('User:', req.user._id);
    console.log('Body:', req.body);

    const { carId, startDate, endDate } = req.body;
    const renterId = req.user._id;

    // التحقق من وجود السيارة
    const car = await Car.findById(carId).populate('ownerId');
    if (!car) {
      console.log('❌ Car not found');
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    console.log('✅ Car found:', car.brand, car.model);

    // التحقق من توفر السيارة
    if (!car.isAvailable) {
      return res.status(400).json({ message: 'هذه السيارة غير متاحة حالياً' });
    }

    const ownerId = car.ownerId._id;
    
    // التحقق من أن المستخدم ليس مالك السيارة
    if (ownerId.toString() === renterId.toString()) {
      return res.status(400).json({ message: 'لا يمكنك حجز سيارتك الخاصة' });
    }

    // التحقق من حالة السيارة
    if (car.status !== 'approved') {
      return res.status(400).json({ message: 'السيارة غير متاحة للحجز' });
    }

    // التحقق من عدم وجود حجز في نفس الفترة
    const existingBooking = await Booking.findOne({
      carId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'السيارة محجوزة في هذه الفترة' });
    }

    // حساب المدة والسعر
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' });
    }

    const pricePerDay = car.pricePerDay;
    const subtotal = pricePerDay * days;
    const commission = subtotal * 0.1;
    const totalPrice = subtotal + commission;

    console.log('💰 Price calculation:', { days, pricePerDay, subtotal, commission, totalPrice });

    // إنشاء الحجز
    const booking = await Booking.create({
      carId,
      renterId,
      startDate,
      endDate,
      durationDays: days,
      totalPrice
    });

    console.log('✅ Booking created:', booking._id);

    // جلب بيانات المستأجر للإشعارات
    const renter = await User.findById(renterId).select('name');

    // 🔔 إشعار للمؤجر (صاحب السيارة)
    try {
      await Notification.create({
        userId: ownerId,
        type: 'booking_pending',
        title: '🔔 حجز جديد على سيارتك',
        message: `قام ${renter.name} بحجز سيارتك ${car.brand} ${car.model} من ${new Date(startDate).toLocaleDateString('ar-TN')} إلى ${new Date(endDate).toLocaleDateString('ar-TN')}`,
        relatedId: booking._id
      });
      console.log('✅ Notification sent to owner');
    } catch (notifError) {
      console.error('❌ Error sending notification to owner:', notifError);
    }

    // 🔔 إشعار لجميع المشرفين
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      console.log(`👥 Found ${admins.length} admins`);
      
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          type: 'booking_pending',
          title: '🔔 حجز جديد بانتظار الموافقة',
          message: `حجز جديد لسيارة ${car.brand} ${car.model} من ${renter.name}`,
          relatedId: booking._id
        });
      }
      console.log('✅ Notifications sent to all admins');
    } catch (notifError) {
      console.error('❌ Error sending notifications to admins:', notifError);
    }

    // إعادة الحجز مع البيانات الكاملة
    const populatedBooking = await Booking.findById(booking._id)
      .populate('carId', 'brand model images pricePerDay location')
      .populate('renterId', 'name email phone');

    res.status(201).json({ 
      success: true, 
      data: populatedBooking,
      message: 'تم إنشاء الحجز بنجاح'
    });

  } catch (error) {
    console.error('❌ Error in createBooking:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc جلب حجوزات المستخدم الحالي
// @route GET /api/bookings/my-bookings
// @access Private
exports.getMyBookings = async (req, res) => {
  try {
    console.log('📋 Fetching bookings for user:', req.user._id);
    
    const bookings = await Booking.find({ renterId: req.user._id })
      .populate('carId', 'brand model images pricePerDay location')
      .sort('-createdAt');

    console.log(`✅ Found ${bookings.length} bookings`);
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('❌ Error in getMyBookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc جلب حجز معين
// @route GET /api/bookings/:id
// @access Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('carId')
      .populate('renterId', 'name email phone');
    
    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('❌ Error in getBookingById:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc جلب جميع الحجوزات (للمشرف)
// @route GET /api/bookings
// @access Private/Admin
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
    res.status(500).json({ message: error.message });
  }
};

// @desc جلب الحجوزات المعلقة (للمشرف)
// @route GET /api/bookings/pending
// @access Private/Admin
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
    res.status(500).json({ message: error.message });
  }
};

// @desc تحديث حالة الحجز (للمشرف)
// @route PATCH /api/bookings/:id/status
// @access Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'حالة غير صالحة' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('carId')
      .populate('renterId');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    booking.status = status;
    await booking.save();

    let title, message;

    // إشعار للمستأجر
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

    await Notification.create({
      userId: booking.renterId._id,
      type: `booking_${status}`,
      title,
      message,
      relatedId: booking._id
    });

    // إشعار للمؤجر في حالة الاكتمال أو الإلغاء
    if (status === 'completed' || status === 'cancelled') {
      await Notification.create({
        userId: booking.carId.ownerId,
        type: `booking_${status}`,
        title: status === 'completed' ? '✅ اكتمال حجز سيارتك' : '❌ إلغاء حجز سيارتك',
        message: status === 'completed' 
          ? `تم اكتمال حجز سيارتك ${booking.carId.brand} ${booking.carId.model}`
          : `تم إلغاء حجز سيارتك ${booking.carId.brand} ${booking.carId.model}`,
        relatedId: booking._id
      });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    جلب حجوزات المستخدم الحالي مع Pagination
// @route   GET /api/bookings/my-bookings?page=1&limit=10
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { renterId: req.user._id };

    const bookings = await Booking.find(query)
      .populate('carId', 'brand model images pricePerDay location')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error in getMyBookings:', error);
    res.status(500).json({ message: error.message });
  }
};