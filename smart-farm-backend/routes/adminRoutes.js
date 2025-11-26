const express = require('express');
const router = express.Router();
const { getStats, getAdvisors, registerAdvisor, getFarmers, getAdmins, registerAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/advisors', protect, admin, getAdvisors);
router.post('/advisors', protect, admin, registerAdvisor);
router.get('/farmers', protect, admin, getFarmers);
router.get('/admins', protect, admin, getAdmins);
router.post('/admins', protect, admin, registerAdmin);

module.exports = router;