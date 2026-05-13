const {
  sequelize,
  User,
  Product,
  Conversation,
  ConversationParticipant,
  Message,
  Attachment,
  Order,
  Review,
  Report
} = require('../models');

exports.getStats = async (req, res) => {
  try {
    const farmersCount = await User.count({ where: { role: 'farmer' } });
    const buyersCount = await User.count({ where: { role: 'buyer' } });
    const adminsCount = await User.count({ where: { role: 'admin' } });
    const productsCount = await Product.count();

    res.json({
      farmers: farmersCount,
      buyers: buyersCount,
      admins: adminsCount,
      products: productsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFarmers = async (req, res) => {
  try {
    const farmers = await User.findAll({
      where: { role: 'farmer' },
      attributes: { exclude: ['password'] }
    });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: { exclude: ['password'] }
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  const bcrypt = require('bcryptjs');

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteConversationData = async (conversationIds, transaction) => {
  if (!conversationIds.length) return;

  const messageRows = await Message.findAll({
    where: { conversationId: conversationIds },
    attributes: ['id'],
    transaction
  });

  const messageIds = messageRows.map(message => message.id);

  await Attachment.destroy({ where: { conversationId: conversationIds }, transaction });
  if (messageIds.length > 0) {
    await Attachment.destroy({ where: { messageId: messageIds }, transaction });
  }
  await Message.destroy({ where: { conversationId: conversationIds }, transaction });
  await ConversationParticipant.destroy({ where: { conversationId: conversationIds }, transaction });
  await Conversation.destroy({ where: { id: conversationIds }, transaction });
};

exports.deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(req.params.id, { transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const productIds = await Product.findAll({
      where: { sellerId: user.id },
      attributes: ['id'],
      transaction
    }).then(rows => rows.map(row => row.id));

    if (productIds.length > 0) {
      await Conversation.update(
        { productId: null },
        { where: { productId: productIds }, transaction }
      );
      await Product.destroy({ where: { id: productIds }, transaction });
    }

    await Order.destroy({ where: { buyerId: user.id }, transaction });
    await Review.destroy({ where: { sellerId: user.id }, transaction });
    await Review.destroy({ where: { buyerId: user.id }, transaction });
    await Report.destroy({ where: { reporterId: user.id }, transaction });
    await Report.destroy({ where: { reportedSellerId: user.id }, transaction });
    await Attachment.destroy({ where: { uploaderId: user.id }, transaction });

    const senderMessageRows = await Message.findAll({
      where: { senderId: user.id },
      attributes: ['id'],
      transaction
    });
    const senderMessageIds = senderMessageRows.map(message => message.id);

    if (senderMessageIds.length > 0) {
      await Attachment.destroy({ where: { messageId: senderMessageIds }, transaction });
    }

    await Message.destroy({ where: { senderId: user.id }, transaction });
    await ConversationParticipant.destroy({ where: { userId: user.id }, transaction });

    const conversationIds = await Conversation.findAll({
      where: { createdBy: user.id },
      attributes: ['id'],
      transaction
    }).then(rows => rows.map(row => row.id));

    await deleteConversationData(conversationIds, transaction);

    await user.destroy({ transaction });
    await transaction.commit();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const adminUser = await User.findByPk(req.params.id);

    if (!adminUser) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (adminUser.role !== 'admin') {
      return res.status(400).json({ message: 'Selected user is not an admin' });
    }

    req.params.id = String(adminUser.id);
    return exports.deleteUser(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findByPk(req.params.id, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    await Conversation.update(
      { productId: null },
      { where: { productId: product.id }, transaction }
    );

    await product.destroy({ transaction });
    await transaction.commit();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};