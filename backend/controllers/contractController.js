const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const generateContractPDF = require('../utils/pdfGenerator');

// @desc    إنشاء عقد PDF لحجز معين (يُستدعى بعد موافقة المشرف)
// @route   POST /api/contracts/generate/:bookingId
// @access  Private/Admin
exports.generateContract = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('carId')
      .populate('renterId');
    if (!booking) return res.status(404).json({ message: 'الحجز غير موجود' });

    const car = booking.carId;
    const renter = booking.renterId;
    const owner = await User.findById(car.ownerId);
    if (!owner) return res.status(404).json({ message: 'المالك غير موجود' });

    const pdfUrl = await generateContractPDF(booking, car, renter, owner);
    booking.contractPdf = pdfUrl;
    await booking.save();

    res.json({ success: true, contractUrl: pdfUrl });
  } catch (error) {
    console.error('Error generating contract:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    توقيع العقد من قبل المستأجر
// @route   PATCH /api/contracts/sign/:bookingId
// @access  Private
exports.signContract = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'الحجز غير موجود' });
    if (booking.renterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح لك بتوقيع هذا العقد' });
    }
    if (!booking.contractPdf) {
      return res.status(400).json({ message: 'العقد غير جاهز بعد' });
    }
    booking.signed = true;
    await booking.save();
    res.json({ success: true, message: 'تم التوقيع بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};