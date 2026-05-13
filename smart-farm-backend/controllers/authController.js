const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { User } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const ensureUploadsDir = (folderName = 'avatars') => {
  const uploadsPath = path.join(__dirname, '..', 'uploads', folderName);
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  return uploadsPath;
};

const saveAvatarFile = async (file) => {
  if (!file) return null;

  const uploadsPath = ensureUploadsDir('avatars');
  const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
  const objectKey = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
  const destination = path.join(uploadsPath, objectKey);

  await fs.promises.writeFile(destination, file.buffer);
  return `/uploads/avatars/${objectKey}`;
};

const shapeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  location: user.location,
  organization: user.organization,
  specialization: user.specialization,
  profession: user.profession,
  profileImage: user.profileImage,
  averageRating: user.averageRating,
  totalReviews: user.totalReviews
});

exports.register = async (req, res) => {
  const { name, email, password, role, phone, location, organization, specialization, profession } = req.body;

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
      role: role || 'farmer',
      phone,
      location,
      organization,
      specialization,
      profession
    });

    if (user) {
      res.status(201).json({
        ...shapeUser(user),
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Email not registered' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.json({
      ...shapeUser(user),
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.location = req.body.location || user.location;
      user.organization = req.body.organization || user.organization;
      user.specialization = req.body.specialization || user.specialization;
      user.profession = req.body.profession || user.profession;

      if (req.file) {
        const avatarPath = await saveAvatarFile(req.file);
        if (avatarPath) user.profileImage = avatarPath;
      } else if (req.body.profileImage) {
        user.profileImage = req.body.profileImage;
      }
      
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();
      
      res.json({
        ...shapeUser(updatedUser),
        token: generateToken(updatedUser.id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};