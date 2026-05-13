const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, getMyProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const uploadProductImage = (req, res, next) => {
	upload.single('image')(req, res, (error) => {
		if (error) {
			return res.status(400).json({ message: error.message || 'File upload failed' });
		}

		return next();
	});
};

router.get('/', getProducts);
router.get('/my', protect, getMyProducts);
router.get('/:id', getProductById);
router.post('/', protect, uploadProductImage, createProduct);
router.put('/:id', protect, uploadProductImage, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;