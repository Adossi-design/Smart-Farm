const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const { DataTypes } = require('sequelize');
const { sequelize, Conversation, ConversationParticipant, Message, User } = require('./models');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const translateRoutes = require('./routes/translateRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const messageRoutesFactory = require('./routes/messageRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://smart-farm-market.vercel.app'
].filter(Boolean);

const isLocalDevOrigin = (origin) => /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(\:\d+)?$/.test(origin);

const isAllowedOrigin = (origin) => !origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin);

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Name', 'X-User-Role']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Farm API Server', status: 'running', version: '1.0.0' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/assistant', assistantRoutes);

// Dev-only: reset all conversations and messages
if (process.env.NODE_ENV !== 'production') {
  app.delete('/api/dev/reset-messages', async (req, res) => {
    try {
      await Message.destroy({ where: {}, truncate: true });
      await require('./models').Attachment.destroy({ where: {}, truncate: true });
      await ConversationParticipant.destroy({ where: {}, truncate: true });
      await Conversation.destroy({ where: {}, truncate: true });
      res.json({ ok: true, message: 'All conversations and messages cleared.' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}

// message routes will be mounted after io is created

// Database Sync and Server Start
const server = http.createServer(app);

// create socket.io server with CORS matching the express config
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST']
  }
});

// mount message routes with access to io
app.use('/api', messageRoutesFactory(io));

// socket handlers
io.on('connection', (socket) => {
  const { userId } = socket.handshake.query || {};
  if (!userId) {
    socket.disconnect(true);
    return;
  }

  socket.join(`user:${userId}`);

  socket.on('join_conversation', async (data) => {
    try {
      const conversationId = data.conversationId || data.conversation_id;
      if (!conversationId) return;
      // verify participant
      const participant = await ConversationParticipant.findOne({ where: { conversationId, userId } });
      if (!participant) return;
      socket.join(`conversation:${conversationId}`);
      socket.emit('conversation_joined', { conversationId });
    } catch (err) {
      console.error('join_conversation error', err);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const conversationId = data.conversationId || data.conversation_id;
      const body = data.body || null;
      const metadata = data.metadata || null;
      if (!conversationId) return;
      const participant = await ConversationParticipant.findOne({ where: { conversationId, userId } });
      if (!participant) return;

      const msg = await Message.create({ conversationId, senderId: userId, body, metadata });
      await Conversation.update({ updatedAt: new Date() }, { where: { id: conversationId } });
      const fullMsg = await Message.findByPk(msg.id, { include: [{ model: User, as: 'sender' }] });
      const shaped = {
        id: fullMsg.id,
        conversationId: fullMsg.conversationId,
        senderId: fullMsg.senderId,
        sender: fullMsg.sender ? { id: fullMsg.sender.id, name: fullMsg.sender.name, role: fullMsg.sender.role } : null,
        body: fullMsg.body,
        metadata: fullMsg.metadata || {},
        deliveredAt: fullMsg.deliveredAt,
        readAt: fullMsg.readAt,
        createdAt: fullMsg.createdAt,
        updatedAt: fullMsg.updatedAt,
        attachments: []
      };
      io.to(`conversation:${conversationId}`).emit('new_message', shaped);
      socket.emit('message_ack', { message: shaped });
    } catch (err) {
      console.error('send_message error', err);
    }
  });

  socket.on('disconnect', () => {});
});

const ensureSqliteUserColumns = async () => {
  if (sequelize.getDialect() !== 'sqlite') {
    return;
  }

  const queryInterface = sequelize.getQueryInterface();
  const userTable = await queryInterface.describeTable('Users');

  if (!Object.prototype.hasOwnProperty.call(userTable, 'profileImage')) {
    await queryInterface.addColumn('Users', 'profileImage', {
      type: DataTypes.STRING,
      allowNull: true
    });
    console.log('Added missing Users.profileImage column');
  }
};

sequelize.sync({ force: false }).then(async () => {
  await ensureSqliteUserColumns();
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

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection error:', err);
});

module.exports = { app, server, io };