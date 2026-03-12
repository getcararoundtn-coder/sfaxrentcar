const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// استخدم بياناتك مباشرة أو من env
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzf4pvsed', 
  api_key: process.env.CLOUDINARY_API_KEY || '314328745593351', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_actual_api_secret_here' // ضع secret الحقيقي هنا
});

console.log('🔍 Testing Cloudinary connection...');

cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg')
  .then(result => {
    console.log('✅ Upload successful!');
    console.log('Public ID:', result.public_id);
    console.log('URL:', result.secure_url);
  })
  .catch(error => {
    console.error('❌ Upload failed:', error);
  });