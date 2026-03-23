const CarDraft = require('../models/CarDraft');
const Car = require('../models/Car');
const { cloudinary } = require('../config/cloudinary');

// @desc    حفظ مسودة سيارة (خطوة بخطوة)
// @route   POST /api/cars/wizard/save
// @access  Private
exports.saveDraft = async (req, res) => {
  try {
    const { step, data } = req.body;
    const ownerId = req.user._id;

    let draft = await CarDraft.findOne({ ownerId, isCompleted: false });

    if (!draft) {
      draft = new CarDraft({ ownerId, step, data });
    } else {
      draft.step = step;
      draft.data = { ...draft.data, ...data };
    }

    await draft.save();

    res.json({
      success: true,
      data: { step: draft.step, data: draft.data, draftId: draft._id }
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    استرجاع مسودة سيارة
// @route   GET /api/cars/wizard/get
// @access  Private
exports.getDraft = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const draft = await CarDraft.findOne({ ownerId, isCompleted: false });

    if (!draft) {
      return res.json({ success: true, data: null });
    }

    res.json({
      success: true,
      data: { step: draft.step, data: draft.data, draftId: draft._id }
    });
  } catch (error) {
    console.error('Error getting draft:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    إكمال الويزارد وإنشاء السيارة النهائية (مع رفع الصور)
// @route   POST /api/cars/wizard/complete
// @access  Private
exports.completeWizard = async (req, res) => {
  try {
    console.log('=== BACKEND: completeWizard START ===');
    console.log('User ID:', req.user?._id);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    
    const ownerId = req.user._id;
    
    // البحث عن المسودة
    const draft = await CarDraft.findOne({ ownerId, isCompleted: false });
    console.log('Draft found:', draft ? draft._id : 'No draft');

    if (!draft) {
      console.log('❌ No draft found for user:', ownerId);
      return res.status(404).json({ 
        success: false,
        message: 'لا توجد مسودة سيارة. الرجاء البدء من البداية.' 
      });
    }

    // دمج البيانات من المسودة و req.body
    const formData = { ...draft.data, ...req.body };
    console.log('📦 Combined form data keys:', Object.keys(formData));
    console.log('Price per day:', formData.pricePerDay);
    console.log('Delivery method:', formData.deliveryMethod);
    console.log('Caution:', formData.caution);

    // التحقق من وجود جميع البيانات المطلوبة
    const requiredFields = [
      'brand', 'model', 'year', 'mileage',
      'licensePlate', 'registrationCountry', 'registrationYear',
      'fuelType', 'transmission',
      'parkingType', 'address', 'city', 'delegation', 'deliveryMethod', 'pricePerDay'
    ];

    const missingFields = [];
    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || value === '' || value === undefined || value === null) {
        missingFields.push(field);
        console.log(`❌ Missing field: ${field}`);
      }
    }

    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      return res.status(400).json({ 
        success: false,
        message: `الحقول المطلوبة غير مكتملة: ${missingFields.join(', ')}` 
      });
    }

    console.log('✅ All required fields are present');

    // ========== استخراج روابط الصور ==========
    let imageUrls = [];
    let insuranceFrontUrl = null;
    let insuranceBackUrl = null;

    // صور السيارة
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      console.log(`📸 Found ${files.length} car images`);
      imageUrls = files.map(file => file.path || file.secure_url || file.url);
      console.log('Image URLs:', imageUrls);
    } else {
      console.log('⚠️ No car images found in request');
    }

    // البطاقة الرمادية recto
    if (req.files && req.files.insuranceFront && req.files.insuranceFront[0]) {
      insuranceFrontUrl = req.files.insuranceFront[0].path || req.files.insuranceFront[0].secure_url;
      console.log('✅ Insurance front URL:', insuranceFrontUrl);
    }

    // البطاقة الرمادية verso
    if (req.files && req.files.insuranceBack && req.files.insuranceBack[0]) {
      insuranceBackUrl = req.files.insuranceBack[0].path || req.files.insuranceBack[0].secure_url;
      console.log('✅ Insurance back URL:', insuranceBackUrl);
    }

    // ========== إنشاء السيارة النهائية ==========
    console.log('🚗 Creating car in database...');
    
    const carData = {
      ownerId,
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year),
      mileage: formData.mileage,
      licensePlate: formData.licensePlate,
      registrationCountry: formData.registrationCountry,
      registrationYear: formData.registrationYear,
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      doors: parseInt(formData.doors) || 4,
      seats: parseInt(formData.seats) || 5,
      features: formData.features || [],
      userType: formData.userType || 'particulier',
      ownerBirthDate: formData.ownerBirthDate,
      paymentPlan: formData.paymentPlan || 'hebdomadaire',
      ownerPhone: formData.ownerPhone,
      ownerPhoneCountry: formData.ownerPhoneCountry || 'Tunisie',
      parkingType: formData.parkingType,
      address: formData.address,
      city: formData.city,
      delegation: formData.delegation,
      deliveryMethod: formData.deliveryMethod,
      pricePerDay: parseFloat(formData.pricePerDay) || 0,
      caution: parseFloat(formData.caution) || 500,
      images: imageUrls,
      insuranceFront: insuranceFrontUrl,
      insuranceBack: insuranceBackUrl,
      status: 'pending'
    };

    console.log('Car data to save:', {
      brand: carData.brand,
      model: carData.model,
      pricePerDay: carData.pricePerDay,
      caution: carData.caution,
      imagesCount: carData.images.length
    });

    const car = await Car.create(carData);
    console.log('✅ Car created successfully with ID:', car._id);

    // حذف المسودة
    draft.isCompleted = true;
    await draft.save();
    console.log('🗑️ Draft marked as completed');

    res.json({
      success: true,
      data: car,
      message: 'تم إضافة السيارة بنجاح، في انتظار موافقة المشرف'
    });
  } catch (error) {
    console.error('❌ Error completing wizard:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: error.message || 'حدث خطأ في إضافة السيارة',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};