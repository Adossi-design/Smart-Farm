const express = require('express');
const router = express.Router();
const { getAdvice, createAdvice, getMyAdvice } = require('../controllers/adviceController');
const { protect, advisor } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.get('/', getAdvice);
router.get('/my', protect, advisor, getMyAdvice);
router.post('/', protect, advisor, upload.single('image'), createAdvice);

module.exports = router;