const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Conversation, ConversationParticipant, Message, Attachment, Product, User } = require('../models');

const asAttachment = (attachment) => {
  const normalizedPath = String(attachment.storagePath || '').replace(/\\/g, '/');
  const url = normalizedPath.startsWith('uploads/')
    ? `/${normalizedPath}`
    : `/uploads/${normalizedPath}`;

  return {
    id: attachment.id,
    messageId: attachment.messageId,
    conversationId: attachment.conversationId,
    filename: attachment.filename,
    contentType: attachment.contentType,
    size: attachment.size,
    storagePath: attachment.storagePath,
    url,
    createdAt: attachment.createdAt
  };
};

const asMessage = (message) => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  sender: message.sender
    ? {
        id: message.sender.id,
        name: message.sender.name,
        role: message.sender.role
      }
    : null,
  body: message.body,
  metadata: message.metadata || {},
  deliveredAt: message.deliveredAt,
  readAt: message.readAt,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
  attachments: Array.isArray(message.attachments) ? message.attachments.map(asAttachment) : []
});

const withConversationShape = async (conversation) => {
  let product = null;
  if (conversation.productId) {
    const productModel = await Product.findByPk(conversation.productId);
    if (productModel) {
      product = {
        id: productModel.id,
        name: productModel.name,
        price: productModel.price,
        quantity: productModel.quantity,
        image: productModel.image
      };
    }
  }

  return {
    id: conversation.id,
    title: conversation.title,
    productId: conversation.productId,
    product,
    // include the last message for quick preview in lists
    lastMessage: null,
    createdBy: conversation.createdBy,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    participants: (conversation.ConversationParticipants || []).map((participant) => ({
      id: participant.id,
      role: participant.role,
      userId: participant.userId,
      user: participant.User
        ? {
            id: participant.User.id,
            name: participant.User.name,
            role: participant.User.role,
            phone: participant.User.phone,
            location: participant.User.location,
            profileImage: participant.User.profileImage
          }
        : null
    }))
  };
};

const createConversation = async (req, res) => {
  const { productId, title, participantIds } = req.body;
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
    return res.status(400).json({ message: 'At least one participant is required' });
  }

  // Deduplicate: find existing conversation with same participants (ignore productId)
  const allParticipantIds = Array.from(new Set([Number(userId), ...participantIds.map(Number)]));
  const existing = await Conversation.findAll({
    include: [{ model: ConversationParticipant }]
  });
  for (const c of existing) {
    const existingIds = (c.ConversationParticipants || []).map(p => Number(p.userId)).sort();
    const newIds = [...allParticipantIds].sort();
    if (existingIds.length === newIds.length && existingIds.every((id, i) => id === newIds[i])) {
      const shaped = await withConversationShape(await Conversation.findByPk(c.id, {
        include: [{ model: ConversationParticipant, include: [User] }]
      }));
      const last = await Message.findOne({ where: { conversationId: c.id }, include: [{ model: User, as: 'sender' }, { model: Attachment }], order: [['createdAt', 'DESC']] });
      if (last) shaped.lastMessage = asMessage(last);
      return res.json(shaped);
    }
  }

  const conv = await Conversation.create({ productId, title, createdBy: userId });

  const participants = allParticipantIds.map((pid) => ({ conversationId: conv.id, userId: pid }));
  await ConversationParticipant.bulkCreate(participants);

  const created = await Conversation.findByPk(conv.id, {
    include: [{ model: ConversationParticipant, include: [User] }]
  });
  // If caller provided an initial message, create it so it appears immediately
  try {
    const initialBody = req.body.initialMessage || req.body.initial_message || req.body.message;
    if (initialBody && String(initialBody).trim()) {
      await Message.create({ conversationId: conv.id, senderId: userId, body: String(initialBody).trim(), metadata: { productId: productId || null } });
      await Conversation.update({ updatedAt: new Date() }, { where: { id: conv.id } });
    } else if (productId) {
      // Auto-create a product reference message so the product preview appears immediately
      await Message.create({ conversationId: conv.id, senderId: userId, body: null, metadata: { productId, type: 'product_reference' } });
      await Conversation.update({ updatedAt: new Date() }, { where: { id: conv.id } });
    }
  } catch (err) {
    console.error('Failed to create initial message for conversation', err);
  }

  // reload conversation including participants
  const reloaded = await Conversation.findByPk(conv.id, {
    include: [{ model: ConversationParticipant, include: [User] }]
  });

  // attach last message in shape
  const shaped = await withConversationShape(reloaded);
  // fetch last message
  const last = await Message.findOne({ where: { conversationId: conv.id }, include: [{ model: User, as: 'sender' }, { model: Attachment }], order: [['createdAt', 'DESC']] });
  if (last) shaped.lastMessage = asMessage(last);

  res.json(shaped);
};

const listConversations = async (req, res) => {
  if (!req.user || !req.user.id) {
    console.error('listConversations: req.user is', req.user);
    return res.status(401).json({ message: 'Unauthorized - no user' });
  }
  const userId = req.user.id;

  const membershipRows = await ConversationParticipant.findAll({
    where: { userId },
    attributes: ['conversationId']
  });
  const conversationIds = membershipRows.map((row) => row.conversationId);
  if (!conversationIds.length) return res.json({ items: [] });

  const conversations = await Conversation.findAll({
    where: { id: conversationIds },
    include: [{ model: ConversationParticipant, include: [User] }],
    order: [['updatedAt', 'DESC']]
  });

  const shaped = await Promise.all(conversations.map(async (conversation) => {
    const mapped = await withConversationShape(conversation);
    const last = await Message.findOne({
      where: { conversationId: conversation.id },
      include: [{ model: User, as: 'sender' }, { model: Attachment }],
      order: [['createdAt', 'DESC']]
    });
    if (last) mapped.lastMessage = asMessage(last);
    return mapped;
  }));
  res.json({ items: shaped });
};

const getConversation = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const participant = await ConversationParticipant.findOne({ where: { conversationId: id, userId } });
  if (!participant) return res.status(403).json({ message: 'Forbidden' });

  const conversation = await Conversation.findOne({
    where: { id },
    include: [{ model: ConversationParticipant, include: [User] }]
  });
  if (!conversation) return res.status(404).json({ message: 'Not found' });

  const mapped = await withConversationShape(conversation);
  const last = await Message.findOne({
    where: { conversationId: conversation.id },
    include: [{ model: User, as: 'sender' }, { model: Attachment }],
    order: [['createdAt', 'DESC']]
  });
  if (last) mapped.lastMessage = asMessage(last);

  res.json(mapped);
};

const listMessages = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // conversation id
  const limit = parseInt(req.query.limit || '50', 10);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  // Ensure participant
  const participant = await ConversationParticipant.findOne({ where: { conversationId: id, userId } });
  if (!participant) return res.status(403).json({ message: 'Forbidden' });

  const messages = await Message.findAll({
    where: { conversationId: id },
    include: [
      { model: User, as: 'sender' },
      { model: Attachment }
    ],
    order: [['createdAt', 'ASC']],
    limit
  });

  res.json({ items: messages.map(asMessage) });
};

const createMessage = async (req, res, io = null) => {
  const userId = req.user.id;
  const { id } = req.params; // conversation id
  const { body, metadata, attachmentIds } = req.body;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const participant = await ConversationParticipant.findOne({ where: { conversationId: id, userId } });
  if (!participant) return res.status(403).json({ message: 'Forbidden' });

  const message = await Message.create({ conversationId: id, senderId: userId, body, metadata: metadata || {} });

  if (attachmentIds && Array.isArray(attachmentIds) && attachmentIds.length) {
    await Attachment.update({ messageId: message.id }, { where: { id: { [Op.in]: attachmentIds }, conversationId: id } });
  }

  // update conversation updatedAt
  await Conversation.update({ updatedAt: new Date() }, { where: { id } });

  const result = await Message.findByPk(message.id, {
    include: [
      { model: User, as: 'sender' },
      { model: Attachment }
    ]
  });

  const shaped = asMessage(result);
  if (io) io.to(`conversation:${id}`).emit('new_message', shaped);

  res.json(shaped);
};

const uploadAttachment = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // conversation id
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const participant = await ConversationParticipant.findOne({ where: { conversationId: id, userId } });
  if (!participant) return res.status(403).json({ message: 'Forbidden' });

  const file = req.file;
  if (!file) return res.status(400).json({ message: 'file is required' });

  const storagePath = path.join('uploads', 'conversations', String(id));
  fs.mkdirSync(storagePath, { recursive: true });
  const destPath = path.join(storagePath, `${Date.now()}_${file.originalname}`);
  fs.renameSync(file.path, destPath);

  const attachment = await Attachment.create({
    conversationId: id,
    uploaderId: userId,
    filename: file.originalname,
    storagePath: destPath,
    contentType: file.mimetype,
    size: file.size
  });
  res.json(asAttachment(attachment));
};

const markDelivered = async (req, res, io = null) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const message = await Message.findByPk(id);
  if (!message) return res.status(404).json({ message: 'Message not found' });

  const participant = await ConversationParticipant.findOne({ where: { conversationId: message.conversationId, userId } });
  if (!participant) return res.status(403).json({ message: 'Forbidden' });

  if (!message.deliveredAt) {
    message.deliveredAt = new Date();
    await message.save();
  }

  if (io) {
    io.to(`conversation:${message.conversationId}`).emit('message_delivered', {
      messageId: message.id,
      deliveredAt: message.deliveredAt
    });
  }

  res.json({ messageId: message.id, deliveredAt: message.deliveredAt });
};

const markRead = async (req, res, io = null) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const message = await Message.findByPk(id);
  if (!message) return res.status(404).json({ message: 'Message not found' });

  const participant = await ConversationParticipant.findOne({ where: { conversationId: message.conversationId, userId } });
  if (!participant) return res.status(403).json({ message: 'Forbidden' });

  if (!message.readAt) {
    message.readAt = new Date();
    await message.save();
  }

  if (io) {
    io.to(`conversation:${message.conversationId}`).emit('message_read', {
      messageId: message.id,
      readAt: message.readAt
    });
  }

  res.json({ messageId: message.id, readAt: message.readAt });
};

const markAllRead = async (req, res, io = null) => {
  const userId = req.user.id;
  const { id } = req.params; // conversation id
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const participant = await ConversationParticipant.findOne({ where: { conversationId: id, userId } });
  if (!participant) return res.status(403).json({ message: 'Forbidden' });

  const now = new Date();
  await Message.update(
    { readAt: now },
    { where: { conversationId: id, senderId: { [Op.ne]: userId }, readAt: null } }
  );

  if (io) io.to(`conversation:${id}`).emit('conversation_read', { conversationId: id, readBy: userId, readAt: now });

  res.json({ ok: true });
};

const unreadCount = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const participant = await ConversationParticipant.findOne({ where: { conversationId: id, userId } });
  if (!participant) return res.status(403).json({ message: 'Forbidden' });

  const count = await Message.count({ where: { conversationId: id, senderId: { [Op.ne]: userId }, readAt: null } });
  res.json({ count });
};

module.exports = {
  createConversation,
  listConversations,
  getConversation,
  listMessages,
  createMessage,
  uploadAttachment,
  markDelivered,
  markRead,
  markAllRead,
  unreadCount
};
