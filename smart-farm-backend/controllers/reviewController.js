const { User, Review, Order } = require('../models');

// Create a new review for a seller
exports.createReview = async (req, res) => {
  try {
    const { sellerId, orderId, rating, comment } = req.body;
    const buyerId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if seller exists
    const seller = await User.findByPk(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Check if buyer already reviewed this seller for this order
    if (orderId) {
      const existingReview = await Review.findOne({
        where: { orderId, buyerId, sellerId }
      });

      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this seller for this order' });
      }
    }

    // Create review
    const review = await Review.create({
      sellerId,
      buyerId,
      orderId,
      rating,
      comment: comment || null
    });

    // Update seller's average rating
    const allReviews = await Review.findAll({ where: { sellerId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await User.update(
      { 
        averageRating: avgRating,
        totalReviews: allReviews.length
      },
      { where: { id: sellerId } }
    );

    res.status(201).json({
      message: 'Review created successfully',
      review,
      sellerRating: avgRating
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Get all reviews for a seller
exports.getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Check if seller exists
    const seller = await User.findByPk(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const reviews = await Review.findAll({
      where: { sellerId },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      seller: {
        id: seller.id,
        name: seller.name,
        profession: seller.profession,
        averageRating: seller.averageRating,
        totalReviews: seller.totalReviews
      },
      reviews
    });
  } catch (error) {
    console.error('Get seller reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Get all reviews given by a buyer
exports.getBuyerReviews = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const reviews = await Review.findAll({
      where: { buyerId },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'profession', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Get buyer reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const buyerId = req.user.id;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only the buyer who created the review can update it
    if (review.buyerId !== buyerId) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    await review.update({
      rating: rating || review.rating,
      comment: comment !== undefined ? comment : review.comment
    });

    // Update seller's average rating
    const allReviews = await Review.findAll({ where: { sellerId: review.sellerId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await User.update(
      { averageRating: avgRating },
      { where: { id: review.sellerId } }
    );

    res.status(200).json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const buyerId = req.user.id;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only the buyer or admin can delete the review
    if (review.buyerId !== buyerId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this review' });
    }

    const sellerId = review.sellerId;
    await review.destroy();

    // Update seller's average rating
    const allReviews = await Review.findAll({ where: { sellerId } });
    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await User.update(
        { 
          averageRating: avgRating,
          totalReviews: allReviews.length
        },
        { where: { id: sellerId } }
      );
    } else {
      await User.update(
        { 
          averageRating: 0,
          totalReviews: 0
        },
        { where: { id: sellerId } }
      );
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};
