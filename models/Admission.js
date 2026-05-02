const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
  {
    // Student Info
    admissionClass: {
      type: String,
      required: [true, 'Admission class is required'],
      enum: ['LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'],
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      maxlength: 12,
    },

    // Parent Info
    fatherName: {
      type: String,
      required: [true, 'Father name is required'],
      trim: true,
    },
    motherName: {
      type: String,
      required: [true, 'Mother name is required'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^\d{10}$/, 'Contact number must be 10 digits'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    fatherOccupation: { type: String, trim: true, default: '' },
    fatherIncome: { type: String, default: '' },
    motherOccupation: { type: String, trim: true, default: '' },
    motherIncome: { type: String, default: '' },
    caste: { type: String, trim: true, default: '' },
    religion: {
      type: String,
      enum: ['Hindu', 'Muslim', 'Christian', 'Others', ''],
      default: '',
    },

    // Uploaded Documents (Cloudinary URLs)
    documents: {
      birthCertificate: { type: String, default: null },
      aadhaarProof: { type: String, default: null },
      casteCertificate: { type: String, default: null },
      transferCertificate: { type: String, default: null },
      passportPhoto: { type: String, default: null },
    },

    // Admin fields
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
admissionSchema.index({ status: 1, createdAt: -1 });
admissionSchema.index({ contactNumber: 1 });
admissionSchema.index({ studentName: 'text', fatherName: 'text', motherName: 'text' });

module.exports = mongoose.model('Admission', admissionSchema);
