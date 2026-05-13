const { Order } = require('../models');

exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, platformFee, total, paymentMethod } = req.body;
    const order = await Order.create({
      buyerId: req.user.id,
      items,
      subtotal,
      platformFee,
      total,
      paymentMethod,
      status: 'pending'
    });
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};
