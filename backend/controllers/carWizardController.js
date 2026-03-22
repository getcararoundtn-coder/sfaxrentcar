const CarDraft = require('../models/CarDraft');
const Car = require('../models/Car');

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

// @desc    إكمال الويزارد وإنشاء السيارة النهائية
// @route   POST /api/cars/wizard/complete
// @access  Private
exports.completeWizard = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const draft = await CarDraft.findOne({ ownerId, isCompleted: false });

    if (!draft) {
      return res.status(404).json({ message: 'لا توجد مسودة سيارة' });
    }

    const { data } = draft;

    // التحقق من وجود جميع البيانات المطلوبة
    const requiredFields = [
      'brand', 'model', 'year', 'mileage',
      'licensePlate', 'registrationCountry', 'registrationYear',
      'fuelType', 'transmission',
      'parkingType', 'address', 'city', 'delegation', 'deliveryMethod'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ message: `حقل ${field} مطلوب` });
      }
    }

    // إنشاء السيارة النهائية
    const car = await Car.create({
      ownerId,
      brand: data.brand,
      model: data.model,
      year: data.year,
      mileage: data.mileage,
      licensePlate: data.licensePlate,
      registrationCountry: data.registrationCountry,
      registrationYear: data.registrationYear,
      fuelType: data.fuelType,
      transmission: data.transmission,
      doors: data.doors || 4,
      seats: data.seats || 5,
      features: data.features || [],
      userType: data.userType || 'particulier',
      ownerBirthDate: data.ownerBirthDate,
      paymentPlan: data.paymentPlan || 'hebdomadaire',
      ownerPhone: data.ownerPhone,
      ownerPhoneCountry: data.ownerPhoneCountry || 'Tunisie',
      parkingType: data.parkingType,
      address: data.address,
      city: data.city,
      delegation: data.delegation,
      deliveryMethod: data.deliveryMethod,
      pricePerDay: data.pricePerDay || 0,
      status: 'pending'
    });

    // حذف المسودة
    draft.isCompleted = true;
    await draft.save();

    res.json({
      success: true,
      data: car,
      message: 'تم إضافة السيارة بنجاح، في انتظار موافقة المشرف'
    });
  } catch (error) {
    console.error('Error completing wizard:', error);
    res.status(500).json({ message: error.message });
  }
};