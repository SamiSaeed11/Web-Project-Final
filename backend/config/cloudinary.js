const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for resumes (PDF only)
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ats/resumes',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

// Storage for cover letters (PDF, DOCX)
const coverLetterStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ats/cover-letters',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw',
  },
});

// Storage for profile pictures
const profilePicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ats/profile-pics',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const uploadResume = multer({ storage: resumeStorage });
const uploadCoverLetter = multer({ storage: coverLetterStorage });
const uploadProfilePic = multer({ storage: profilePicStorage });

module.exports = {
  cloudinary,
  uploadResume,
  uploadCoverLetter,
  uploadProfilePic,
};
