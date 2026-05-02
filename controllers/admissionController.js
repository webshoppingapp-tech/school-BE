const Admission = require('../models/Admission');

// @desc  Submit new admission application
// @route POST /api/admission
// @access Public
const submitAdmission = async (req, res) => {
  try {
    const {
      admissionClass,
      studentName,
      fatherName,
      motherName,
      // Backward-compat: some older clients used a single `parentName` field
      parentName,
      address,
      contactNumber,
      bloodGroup, aadhaarNumber, fatherOccupation, fatherIncome,
      motherOccupation, motherIncome, caste, religion,
    } = req.body;

    // Build documents object from Cloudinary uploaded files
    const documents = {};
    const fileFields = ['birthCertificate', 'aadhaarProof', 'casteCertificate', 'transferCertificate', 'passportPhoto'];

    fileFields.forEach((field) => {
      if (req.files && req.files[field] && req.files[field][0]) {
        documents[field] = req.files[field][0].path; // Cloudinary URL
      }
    });

    // Validate required docs
    if (!documents.birthCertificate) {
      return res.status(400).json({ success: false, message: 'Birth Certificate is required' });
    }
    if (!documents.aadhaarProof) {
      return res.status(400).json({ success: false, message: 'Aadhaar Proof is required' });
    }
    if (!documents.passportPhoto) {
      return res.status(400).json({ success: false, message: 'Passport Photo is required' });
    }

    const admission = await Admission.create({
      admissionClass,
      studentName,
      fatherName: fatherName || parentName,
      motherName: motherName || parentName,
      address,
      contactNumber,
      bloodGroup: bloodGroup || '',
      aadhaarNumber: aadhaarNumber || '',
      fatherOccupation: fatherOccupation || '',
      fatherIncome: fatherIncome || '',
      motherOccupation: motherOccupation || '',
      motherIncome: motherIncome || '',
      caste: caste || '',
      religion: religion || '',
      documents,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! We will contact you within 2-3 working days.',
      applicationId: admission._id,
    });
  } catch (err) {
    console.error('Admission submission error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = { submitAdmission };
