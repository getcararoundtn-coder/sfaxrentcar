const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinary').cloudinary;
const { PassThrough } = require('stream');

const generateContractPDF = async (booking, car, renter, owner) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const stream = doc.pipe(new PassThrough());
      const chunks = [];

      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);
        try {
          const result = await new Promise((resolveUpload, rejectUpload) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { 
                folder: 'sfaxrentcar/contracts', 
                resource_type: 'raw', 
                format: 'pdf',
                public_id: `contract_${booking._id}`
              },
              (error, result) => {
                if (error) {
                  console.error('❌ Cloudinary upload error:', error);
                  rejectUpload(error);
                } else {
                  console.log('✅ PDF uploaded to Cloudinary:', result.secure_url);
                  resolveUpload(result);
                }
              }
            );
            uploadStream.end(pdfBuffer);
          });
          resolve(result.secure_url);
        } catch (uploadError) {
          console.error('❌ Upload failed:', uploadError);
          reject(uploadError);
        }
      });

      // ========== محتوى PDF باللغة الإنجليزية (للتأكد من ظهوره) ==========
      doc.fontSize(24).text('RENTAL CONTRACT - SfaxRentCar', { align: 'center' }).moveDown(2);

      doc.fontSize(16).text('1. PARTIES INFORMATION', { underline: true }).moveDown(0.5);
      
      doc.fontSize(14).text('Owner:');
      doc.fontSize(12)
        .text(`Full Name: ${owner.name || 'Not specified'}`)
        .text(`Email: ${owner.email || 'Not specified'}`)
        .text(`Phone: ${owner.phone || 'Not specified'}`)
        .moveDown();

      doc.fontSize(14).text('Renter:');
      doc.fontSize(12)
        .text(`Full Name: ${renter.name || 'Not specified'}`)
        .text(`Email: ${renter.email || 'Not specified'}`)
        .text(`Phone: ${renter.phone || 'Not specified'}`)
        .moveDown();

      doc.fontSize(16).text('2. VEHICLE INFORMATION', { underline: true }).moveDown(0.5);
      doc.fontSize(12)
        .text(`Car: ${car.brand || ''} ${car.model || ''} (${car.year || ''})`)
        .text(`Price per day: ${car.pricePerDay || '0'} TND`)
        .text(`Deposit: ${car.deposit || '0'} TND`)
        .moveDown();

      doc.fontSize(16).text('3. BOOKING DETAILS', { underline: true }).moveDown(0.5);
      const start = booking.startDate ? new Date(booking.startDate).toLocaleDateString('en-GB') : 'Not specified';
      const end = booking.endDate ? new Date(booking.endDate).toLocaleDateString('en-GB') : 'Not specified';
      const days = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
      
      doc.fontSize(12)
        .text(`Start Date: ${start}`)
        .text(`End Date: ${end}`)
        .text(`Days: ${days}`)
        .text(`Total Price: ${booking.totalPrice || '0'} TND (includes 10% fee)`)
        .moveDown();

      doc.fontSize(16).text('4. TERMS AND CONDITIONS', { underline: true }).moveDown(0.5);
      const terms = [
        'The renter is responsible for the vehicle during the rental period.',
        'Any damages must be reported immediately to the owner.',
        'The vehicle must be returned in the same condition as received.',
        'Traffic fines are the responsibility of the renter.',
        'The deposit will be refunded upon return of the vehicle in good condition.'
      ];
      
      terms.forEach(term => {
        doc.fontSize(12).text(`• ${term}`);
      });
      doc.moveDown();

      doc.fontSize(16).text('5. SIGNATURES', { underline: true }).moveDown(0.5);
      doc.fontSize(12)
        .text('Renter Signature: ____________________')
        .text('Owner Signature: ____________________')
        .text(`Date: ${new Date().toLocaleDateString('en-GB')}`)
        .moveDown();

      doc.fontSize(10).text(`Contract ID: ${booking._id}`, { align: 'center' });
      doc.fontSize(10).text('This contract was generated electronically by SfaxRentCar.', { align: 'center' });

      doc.end();
      
    } catch (error) {
      console.error('❌ Error in generateContractPDF:', error);
      reject(error);
    }
  });
};

module.exports = generateContractPDF;