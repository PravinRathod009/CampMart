// multer-storage-cloudinary expects the FULL cloudinary module
// (it internally calls cloudinary.v2.uploader.upload_stream),
// so we export the whole module here, not just `.v2`.
const cloudinary = require("cloudinary");

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
