const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Notification = require('../models/Notification');

// @desc    إضافة تقييم بعد انتهاء الحجز
// @route   POST /api/reviews
// @access  Private (المستأجر فقط)
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId)
      .populate('carId')
      .populate('renterId');

    if (!booking) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }

    // التحقق من أن المستخدم هو المستأجر
    if (booking.renterId._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بتقييم هذا الحجز' });
    }

    // التحقق من اكتمال الحجز
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'لا يمكن تقييم الحجز إلا بعد اكتماله' });
    }

    // التحقق من عدم وجود تقييم سابق
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'لقد قيمت هذا الحجز مسبقاً' });
    }

    // إنشاء التقييم
    const review = await Review.create({
      bookingId,
      carId: booking.carId._id,
      reviewerId: userId,
      ownerId: booking.carId.ownerId,
      rating,
      comment
    });

    // تحديث الحجز (إذا كان حقل hasReview موجوداً)
    try {
      await Booking.findByIdAndUpdate(bookingId, { hasReview: true });
    } catch (updateError) {
      console.log('حقل hasReview غير موجود في نموذج Booking');
    }

    // إنشاء إشعار لصاحب السيارة
    try {
      await Notification.create({
        userId: booking.carId.ownerId,
        type: 'new_review',
        title: '⭐ تقييم جديد على سيارتك',
        message: `قام المستأجر ${booking.renterId.name} بتقييم سيارتك ${booking.carId.brand} ${booking.carId.model} بـ ${rating} نجوم`,
        relatedId: review._id,
        isRead: false
      });
    } catch (notifError) {
      console.error('فشل إنشاء إشعار التقييم:', notifError);
    }

    res.status(201).json({ 
      success: true, 
      data: review,
      message: 'تم إضافة التقييم بنجاح'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب تقييمات سيارة معينة مع Pagination
// @route   GET /api/reviews/car/:carId?page=1&limit=10
// @access  Public
exports.getCarReviews = async (req, res) => {
  try {
    const { carId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // التحقق من وجود السيارة
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'السيارة غير موجودة' });
    }

    // جلب التقييمات مع Pagination
    const reviews = await Review.find({ carId })
      .populate('reviewerId', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ carId });

    // ✅ حساب متوسط التقييمات - تم إصلاح مشكلة ObjectId
    let avgResult = [];
    try {
      // استخدام new مع ObjectId
      avgResult = await Review.aggregate([
        { $match: { carId: new mongoose.Types.ObjectId(carId) } },
        { $group: { 
          _id: null, 
          average: { $avg: '$rating' }, 
          count: { $sum: 1 }
        } }
      ]);
    } catch (aggError) {
      console.error('Error in aggregation:', aggError);
      // إذا فشل الـ aggregation، نستخدم طريقة بديلة
      const allRatings = await Review.find({ carId }).select('rating');
      if (allRatings.length > 0) {
        const sum = allRatings.reduce((acc, r) => acc + r.rating, 0);
        avgResult = [{ average: sum / allRatings.length, count: allRatings.length }];
      }
    }

    // توزيع التقييمات (كم تقييم لكل نجمة)
    let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    const allRatings = await Review.find({ carId }).select('rating');
    allRatings.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      }
    });

    const average = avgResult.length > 0 ? parseFloat(avgResult[0].average).toFixed(1) : 0;
    const totalReviews = avgResult.length > 0 ? avgResult[0].count : 0;

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        stats: {
          average,
          total: totalReviews,
          distribution
        }
      }
    });
  } catch (error) {
    console.error('Error getting car reviews:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب أحدث التقييمات (للواجهة الرئيسية)
// @route   GET /api/reviews/latest
// @access  Public
exports.getLatestReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('reviewerId', 'name')
      .populate('carId', 'brand model images')
      .sort('-createdAt')
      .limit(6);

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error getting latest reviews:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب تقييمات المستخدم الحالي (كتقييمات قام بها)
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewerId: req.user._id })
      .populate('carId', 'brand model images')
      .sort('-createdAt');

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error getting my reviews:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب تقييمات سيارات المستخدم (للمالك - التقييمات التي تلقاها)
// @route   GET /api/reviews/owner-reviews
// @access  Private
exports.getOwnerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ ownerId: req.user._id })
      .populate('reviewerId', 'name')
      .populate('carId', 'brand model images')
      .sort('-createdAt');

    // حساب متوسط التقييمات للمالك
    const avgResult = await Review.aggregate([
      { $match: { ownerId: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { 
        _id: null, 
        average: { $avg: '$rating' }
      } }
    ]);

    const averageRating = avgResult.length > 0 ? parseFloat(avgResult[0].average).toFixed(1) : 0;

    res.json({ 
      success: true, 
      data: {
        reviews,
        stats: {
          total: reviews.length,
          averageRating
        }
      }
    });
  } catch (error) {
    console.error('Error getting owner reviews:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    حذف تقييم (للمشرف أو صاحب التقييم)
// @route   DELETE /api/reviews/:id
// @access  Private (Admin or reviewer)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'التقييم غير موجود' });
    }

    // التحقق من الصلاحية: المشرف أو صاحب التقييم
    if (req.user.role !== 'admin' && review.reviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذا التقييم' });
    }

    await Review.findByIdAndDelete(req.params.id);

    // تحديث الحجز (إذا كان حقل hasReview موجوداً)
    try {
      await Booking.findByIdAndUpdate(review.bookingId, { hasReview: false });
    } catch (updateError) {
      console.log('حقل hasReview غير موجود في نموذج Booking');
    }

    res.json({ success: true, message: 'تم حذف التقييم بنجاح' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    التحقق من إمكانية تقييم حجز معين
// @route   GET /api/reviews/check/:bookingId
// @access  Private
exports.checkCanReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ canReview: false, message: 'الحجز غير موجود' });
    }

    // التحقق من أن المستخدم هو المستأجر
    if (booking.renterId.toString() !== userId.toString()) {
      return res.json({ canReview: false, message: 'لست مستأجر هذا الحجز' });
    }

    // التحقق من اكتمال الحجز
    if (booking.status !== 'completed') {
      return res.json({ canReview: false, message: 'الحجز لم يكتمل بعد' });
    }

    // التحقق من عدم وجود تقييم سابق
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.json({ canReview: false, message: 'قمت بتقييم هذا الحجز مسبقاً' });
    }

    res.json({ 
      canReview: true, 
      message: 'يمكنك تقييم هذا الحجز',
      booking: {
        id: booking._id,
        carId: booking.carId,
        startDate: booking.startDate,
        endDate: booking.endDate
      }
    });
  } catch (error) {
    console.error('Error checking review:', error);
    res.status(500).json({ message: error.message });
  }
};