const { User, Product, Advice } = require('../models');

exports.getStats = async (req, res) => {
  try {
    const farmersCount = await User.count({ where: { role: 'farmer' } });
    const advisorsCount = await User.count({ where: { role: 'advisor' } });
    const productsCount = await Product.count();
    const adviceCount = await Advice.count();

    res.json({
      farmers: farmersCount,
      advisors: advisorsCount,
      products: productsCount,
      advice: adviceCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdvisors = async (req, res) => {
  try {
    const advisors = await User.findAll({ 
      where: { role: 'advisor' },
      attributes: { exclude: ['password'] }
    });
    res.json(advisors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerAdvisor = async (req, res) => {
  // Re-use auth controller logic or call it directly? 
  // Better to have separate logic or just use the register endpoint with admin check?
  // Let's implement a specific one here.
  const { name, email, password, organization, specialization } = req.body;
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
      role: 'advisor',
      organization,
      specialization
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