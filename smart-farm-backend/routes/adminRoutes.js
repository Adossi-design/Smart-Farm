const express = require('express');
const router = express.Router();
const { getStats, getUsers, getFarmers, getAdmins, registerAdmin, deleteUser, deleteAdmin, deleteProduct } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getUsers);
router.get('/farmers', protect, admin, getFarmers);
router.get('/admins', protect, admin, getAdmins);
router.post('/admins', protect, admin, registerAdmin);
router.delete('/users/:id', protect, admin, deleteUser);
router.delete('/farmers/:id', protect, admin, deleteUser);
router.delete('/admins/:id', protect, admin, deleteAdmin);
router.delete('/products/:id', protect, admin, deleteProduct);

module.exports = router;