const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  adminLogin,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getStats,
} = require('../controllers/adminController');

// POST /api/admin/login
router.post('/login', adminLogin);

// All routes below require authentication
router.use(authMiddleware);

// GET /api/admin/applications
router.get('/applications', getApplications);

// GET /api/admin/applications/:id
router.get('/applications/:id', getApplicationById);

// PATCH /api/admin/applications/:id/status
router.patch('/applications/:id/status', updateApplicationStatus);

// DELETE /api/admin/applications/:id
router.delete('/applications/:id', deleteApplication);

// GET /api/admin/stats
router.get('/stats', getStats);

module.exports = router;
