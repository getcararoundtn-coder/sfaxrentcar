const Car = require('../models/Car');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { uploadCarImages } = require('../config/cloudinary');

// @desc    إضافة سيارة جديدة
// @route   POST /api/cars
// @access  Private
exports.addCar = async (req, res) => {
  uploadCarImages(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { brand, model, year, licensePlate, pricePerDay, deposit, location, fuelType, seats } = req.body;
      
      if (!brand || !model || !year || !licensePlate || !pricePerDay || !deposit || !location || !fuelType || !seats) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
      }

      const owner = await User.findById(req.user._id);
      
      const images = req.files?.images ? req.files.images.map(file => file.path) : [];
      const insuranceFront = req.files?.insuranceFront ? req.files.insuranceFront[0].path : null;
      const insuranceBack = req.files?.insuranceBack ? req.files.insuranceBack[0].path : null;

      let contractPdf = null;
      if (owner.role !== 'company') {
        console.log('إضافة سيارة من قبل فرد');
      }

      const car = await Car.create({
        ownerId: req.user._id,
        brand,
        model,
        year,
        licensePlate,
        insuranceFront,
        insuranceBack,
        contractPdf,
        pricePerDay,
        deposit,
        location,
        fuelType,
        seats,
        images,
        status: 'pending',
        isAvailable: true
      });

      // إشعار للمشرفين بسيارة جديدة
      try {
        const admins = await User.find({ role: 'admin' }).select('_id');
        for (const admin of admins) {
          await Notification.create({
            userId: admin._id,
            type: 'car_pending',
            title: '🚗 سيارة جديدة بانتظار الموافقة',
            message: `تمت إضافة سيارة ${car.brand} ${car.model} جديدة من قبل ${owner.name}`,
            relatedId: car._id
          });
        }
      } catch (notifError) {
        console.error('فشل إنشاء إشعار للمشرفين:', notifError);
      }

      res.status(201).json({ success: true, data: car });
    } catch (error) {
      console.error('Error adding car:', error);
      res.status(500).json({ message: error.message });
    }
  });
};

// @desc    جلب جميع السيارات المتاحة (مع تصفية حسب التاريخ)
// @route   GET /api/cars
// @access  Public
exports.getCars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { startDate, endDate } = req.query;

    let query = {
      status: 'approved',
      $or: [
        { isAvailable: true },
        { isAvailable: { $exists: false } }
      ]
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const bookedCars = await Booking.find({
        status: { $in: ['pending', 'approved'] },
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } }
        ]
      }).distinct('carId');
      query._id = { $nin: bookedCars };
    }

    const cars = await Car.find(query)
      .populate('ownerId', 'name email role')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    const total = await Car.countDocuments(query);

    res.json({
      success: true,
      data: cars,
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
    console.error('❌ Error in getCars:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب السيارات المميزة (Featured)
// @route   GET /api/cars/featured
// @access  Public
exports.getFeaturedCars = async (req, res) => {
  try {
    // هنا يمكنك تعديل معايير "المميزة" كما تشاء. مثال: آخر 6 سيارات معتمدة
    const cars = await Car.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('ownerId', 'name');
    res.json({ success: true, data: cars });
  } catch (error) {
    console.error('❌ Error in getFeaturedCars:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    جلب إحصائيات السيارات
// @route   GET /api/cars/stats
// @access  Public
exports.getCarStats = async (req, res) => {
  try {
    const totalCars = await Car.countDocuments({ status: 'approved' });
    // يمكنك لاحقاً حساب الأرقام الحقيقية
    const stats = {
      totalCars,
      happyCustomers: 1200, // يمكن حسابها من عدد المستخدمين أو الحجوزات المكتملة
      cities: 25            // يمكن حسابها من مواقع السيارات المختلفة
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Error in getCarStats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    جلب سيارة واحدة
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('ownerId', 'name email phone role');
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }
    res.json({ success: true, data: car });
  } catch (error) {
    console.error('❌ Error in getCarById:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب السيارات المعلقة (للمشرف)
// @route   GET /api/cars/pending
// @access  Private/Admin
exports.getPendingCars = async (req, res) => {
  try {
    const cars = await Car.find({ status: 'pending' }).populate('ownerId', 'name email phone');
    res.json({ success: true, data: cars });
  } catch (error) {
    console.error('❌ Error in getPendingCars:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب جميع السيارات (للمشرف)
// @route   GET /api/cars/all
// @access  Private/Admin
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find()
      .populate('ownerId', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, data: cars });
  } catch (error) {
    console.error('❌ Error in getAllCars:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    الموافقة على سيارة
// @route   PATCH /api/cars/:id/approve
// @access  Private/Admin
exports.approveCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }
    res.json({ success: true, data: car });
  } catch (error) {
    console.error('❌ Error in approveCar:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    رفض سيارة
// @route   PATCH /api/cars/:id/reject
// @access  Private/Admin
exports.rejectCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }
    res.json({ success: true, data: car });
  } catch (error) {
    console.error('❌ Error in rejectCar:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== دوال المالك ==========

// @desc    جلب سيارات المستخدم الحالي (المؤجر)
// @route   GET /api/cars/my-cars
// @access  Private
exports.getMyCars = async (req, res) => {
  try {
    console.log('Fetching my cars for user:', req.user._id);
    
    const cars = await Car.find({ ownerId: req.user._id })
      .populate('ownerId', 'name email')
      .sort('-createdAt');
    
    console.log(`Found ${cars.length} cars for user`);
    res.json({ success: true, data: cars });
  } catch (error) {
    console.error('❌ Error in getMyCars:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في جلب سياراتك',
      error: error.message 
    });
  }
};

// @desc    تحديث بيانات السيارة (للمالك فقط)
// @route   PUT /api/cars/:id
// @access  Private
exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    if (car.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذه السيارة' });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: updatedCar });
  } catch (error) {
    console.error('❌ Error in updateCar:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    حذف سيارة (للمالك فقط)
// @route   DELETE /api/cars/:id
// @access  Private
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    if (car.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذه السيارة' });
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف السيارة' });
  } catch (error) {
    console.error('❌ Error in deleteCar:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    تحديث حالة توفر السيارة (متاحة/غير متاحة)
// @route   PATCH /api/cars/:id/toggle-availability
// @access  Private (المالك فقط)
exports.toggleCarAvailability = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    if (car.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذه السيارة' });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();

    res.json({ 
      success: true, 
      data: car,
      message: car.isAvailable ? 'السيارة متاحة الآن' : 'السيارة غير متاحة الآن'
    });
  } catch (error) {
    console.error('❌ Error in toggleCarAvailability:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب حجوزات سيارات المستخدم (المؤجر)
// @route   GET /api/cars/my-bookings
// @access  Private
exports.getMyCarBookings = async (req, res) => {
  try {
    console.log('Fetching my car bookings for user:', req.user._id);
    
    const cars = await Car.find({ ownerId: req.user._id }).select('_id');
    const carIds = cars.map(car => car._id);
    
    if (carIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const bookings = await Booking.find({ carId: { $in: carIds } })
      .populate({
        path: 'carId',
        select: 'brand model images pricePerDay location ownerId'
      })
      .populate({
        path: 'renterId',
        select: 'name email phone'
      })
      .sort('-createdAt');

    console.log(`Found ${bookings.length} bookings for user's cars`);
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('❌ Error in getMyCarBookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في جلب حجوزات سياراتك',
      error: error.message 
    });
  }
};

// @desc    إلغاء حجز من قبل المؤجر
// @route   PATCH /api/cars/cancel-booking/:bookingId
// @access  Private (المالك فقط)
exports.cancelBookingByOwner = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate({
        path: 'carId',
        select: 'brand model ownerId'
      });

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    if (!booking.carId || booking.carId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بإلغاء هذا الحجز' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'لا يمكن إلغاء هذا الحجز' });
    }

    booking.status = 'cancelled';
    await booking.save();

    try {
      await Notification.create({
        userId: booking.renterId,
        type: 'booking_cancelled',
        title: '❌ تم إلغاء حجزك من قبل المالك',
        message: `تم إلغاء حجزك لسيارة ${booking.carId.brand} ${booking.carId.model} من قبل المالك.`,
        relatedId: booking._id
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار الإلغاء:', notifError);
    }

    res.json({ success: true, message: 'تم إلغاء الحجز بنجاح' });
  } catch (error) {
    console.error('❌ Error in cancelBookingByOwner:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب إحصائيات المؤجر
// @route   GET /api/cars/owner-stats
// @access  Private
exports.getOwnerStats = async (req, res) => {
  try {
    const ownerId = req.user._id;
    console.log('Fetching owner stats for user:', ownerId);

    const cars = await Car.find({ ownerId });
    const carIds = cars.map(car => car._id);

    const totalCars = cars.length;
    const availableCars = cars.filter(car => car.isAvailable && car.status === 'approved').length;
    const pendingCars = cars.filter(car => car.status === 'pending').length;
    const approvedCars = cars.filter(car => car.status === 'approved').length;

    let totalBookings = 0;
    let completedBookings = 0;
    let pendingBookings = 0;
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let pendingRevenue = 0;

    if (carIds.length > 0) {
      try {
        const bookings = await Booking.find({ 
          carId: { $in: carIds }
        });

        totalBookings = bookings.length;
        pendingBookings = bookings.filter(b => b.status === 'pending').length;
        
        const completedBookingsList = bookings.filter(b => b.status === 'completed');
        completedBookings = completedBookingsList.length;
        totalRevenue = completedBookingsList.reduce((sum, b) => sum + b.totalPrice, 0);

        const approvedBookingsList = bookings.filter(b => b.status === 'approved');
        pendingRevenue = approvedBookingsList.reduce((sum, b) => sum + b.totalPrice, 0);

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        
        const monthlyBookings = completedBookingsList.filter(b => 
          b.createdAt && new Date(b.createdAt) >= last30Days
        );
        monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      } catch (bookingError) {
        console.error('Error fetching bookings:', bookingError);
      }
    }

    let averageRating = 0;
    if (carIds.length > 0) {
      try {
        const allReviews = await Review.find({ carId: { $in: carIds } });
        if (allReviews.length > 0) {
          const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
          averageRating = (sum / allReviews.length).toFixed(1);
        }
      } catch (reviewError) {
        console.error('Error fetching reviews:', reviewError);
      }
    }

    const stats = {
      cars: {
        total: totalCars,
        available: availableCars,
        pending: pendingCars,
        approved: approvedCars
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        pending: pendingRevenue
      },
      averageRating: parseFloat(averageRating) || 0
    };

    console.log('Owner stats:', stats);
    res.json({ success: true, data: stats });

  } catch (error) {
    console.error('❌ Error in getOwnerStats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في جلب الإحصائيات',
      error: error.message 
    });
  }
};