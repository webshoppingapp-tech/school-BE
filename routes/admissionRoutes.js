const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { submitAdmission } = require('../controllers/admissionController');

// Multiple file fields for document upload
const uploadFields = upload.fields([
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'aadhaarProof', maxCount: 1 },
  { name: 'casteCertificate', maxCount: 1 },
  { name: 'transferCertificate', maxCount: 1 },
  { name: 'passportPhoto', maxCount: 1 },
]);

// Error handling wrapper for multer
const handleUpload = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size must be under 5MB' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// POST /api/admission - Submit admission form
router.post('/', handleUpload, submitAdmission);

module.exports = router;
