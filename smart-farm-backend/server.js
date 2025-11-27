const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adviceRoutes = require('./routes/adviceRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://smart-farm-market.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/advice', adviceRoutes);
app.use('/api/admin', adminRoutes);

// Database Sync and Server Start
sequelize.sync({ force: false }).then(async () => {
  console.log('Database connected and synced');
  
  // Seed Admin User if not exists
  const { User } = require('./models');
  const bcrypt = require('bcryptjs');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password';

  const adminExists = await User.findOne({ where: { email: adminEmail } });
  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Admin user seeded');
  }

  // Seed Advisor User if not exists
  const advisorEmail = process.env.ADVISOR_EMAIL || 'advisor@test.com';
  const advisorPassword = process.env.ADVISOR_PASSWORD || 'password';

  const advisorExists = await User.findOne({ where: { email: advisorEmail } });
  if (!advisorExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(advisorPassword, salt);
    await User.create({
      name: 'Agronomist Sarah',
      email: advisorEmail,
      password: hashedPassword,
      role: 'advisor',
      organization: 'Green NGO',
      specialization: 'Soil Science'
    });
    console.log('Advisor user seeded');
  }

  // Seed Farmer User if not exists
  const farmerEmail = process.env.FARMER_EMAIL || 'farmer@test.com';
  const farmerPassword = process.env.FARMER_PASSWORD || 'password';

  const farmerExists = await User.findOne({ where: { email: farmerEmail } });
  if (!farmerExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(farmerPassword, salt);
    await User.create({
      name: 'Farmer John',
      email: farmerEmail,
      password: hashedPassword,
      role: 'farmer',
      phone: '+250788123456',
      location: 'Musanze'
    });
    console.log('Farmer user seeded');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection error:', err);
});

module.exports = app;