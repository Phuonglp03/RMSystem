const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file objects (from multer), each with a buffer property
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Array>} - Array of uploaded image URLs
 */
async function uploadImages(files, folder = 'uploads') {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map(file =>
    new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      ).end(file.buffer);
    })
  );
  return Promise.all(uploadPromises);
}

module.exports = {
  uploadImages,
};
