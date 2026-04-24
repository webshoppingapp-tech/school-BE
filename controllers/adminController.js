const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admission = require('../models/Admission');

// @desc  Admin login
// @route POST /api/admin/login
// @access Public
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { username, role: 'admin' },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get all admission applications
// @route GET /api/admin/applications
// @access Private (Admin)
const getApplications = async (req, res) => {
  try {
    const { status, admissionClass, search, page = 1, limit = 100 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (admissionClass) query.admissionClass = admissionClass;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const applications = await Admission.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Admission.countDocuments(query);

    res.json({
      success: true,
      applications,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get single application
// @route GET /api/admin/applications/:id
// @access Private (Admin)
const getApplicationById = async (req, res) => {
  try {
    const application = await Admission.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Update application status
// @route PATCH /api/admin/applications/:id/status
// @access Private (Admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const application = await Admission.findByIdAndUpdate(
      req.params.id,
      { status, ...(adminNotes && { adminNotes }) },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, message: `Application ${status}`, application });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Delete application
// @route DELETE /api/admin/applications/:id
// @access Private (Admin)
const deleteApplication = async (req, res) => {
  try {
    const application = await Admission.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get dashboard stats
// @route GET /api/admin/stats
// @access Private (Admin)
const getStats = async (req, res) => {
  try {
    const total = await Admission.countDocuments();
    const pending = await Admission.countDocuments({ status: 'pending' });
    const approved = await Admission.countDocuments({ status: 'approved' });
    const rejected = await Admission.countDocuments({ status: 'rejected' });

    // Monthly data for the current year
    const currentYear = new Date().getFullYear();
    const monthlyData = await Admission.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Class-wise distribution
    const classDist = await Admission.aggregate([
      { $group: { _id: '$admissionClass', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: { total, pending, approved, rejected },
      monthlyData,
      classDist,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  adminLogin,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getStats,
};
