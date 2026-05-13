const express = require('express');
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a report (authenticated users only)
router.post('/', protect, reportController.createReport);

// Get all reports (admin only)
router.get('/', protect, reportController.getAllReports);

// Get reports for a specific seller (admin or seller themselves)
router.get('/seller/:sellerId', protect, reportController.getSellerReports);

// Get reports submitted by the authenticated buyer
router.get('/my-reports', protect, reportController.getBuyerReports);

// Update report status (admin only)
router.put('/:reportId', protect, reportController.updateReportStatus);

module.exports = router;
