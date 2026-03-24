const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// تخزين صور السيارات
const carStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sfaxrentcar/cars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

// تخزين الملفات العامة (PDF، مستندات)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sfaxrentcar/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});

// ✅ Middleware لرفع صور السيارات (متعددة) - باستخدام multer-storage-cloudinary
const uploadCarImages = multer({ storage: carStorage }).fields([
  { name: 'images', maxCount: 10 },
  { name: 'insuranceFront', maxCount: 1 },
  { name: 'insuranceBack', maxCount: 1 },
  { name: 'contractPdf', maxCount: 1 }
]);

// ✅ Middleware لرفع مستندات المستخدم (الهوية، رخصة القيادة)
const uploadDocuments = multer({ storage: documentStorage }).fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'driverLicense', maxCount: 1 }
]);

// ✅ دالة مساعدة لرفع صورة مباشرة (للاستخدام في carWizardController)
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      transformation: [{ width: 800, height: 600, crop: 'limit' }]
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

// ✅ دالة لحذف صورة من Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return null;
  }
};

module.exports = { 
  cloudinary, 
  uploadCarImages, 
  uploadDocuments,
  uploadToCloudinary,
  deleteFromCloudinary
};