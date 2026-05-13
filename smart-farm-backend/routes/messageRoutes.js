const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/tmp' });
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

module.exports = (io) => {
  // All conversation/message endpoints require auth
  router.post('/conversations', protect, messageController.createConversation);
  router.get('/conversations', protect, messageController.listConversations);
  router.get('/conversations/:id', protect, messageController.getConversation);
  router.get('/conversations/:id/messages', protect, messageController.listMessages);
  router.post('/conversations/:id/messages', protect, (req, res) => messageController.createMessage(req, res, io));
  router.post('/conversations/:id/attachments', protect, upload.single('file'), messageController.uploadAttachment);
  router.patch('/messages/:id/delivered', protect, (req, res) => messageController.markDelivered(req, res, io));
  router.patch('/messages/:id/read', protect, (req, res) => messageController.markRead(req, res, io));
  router.patch('/conversations/:id/read-all', protect, (req, res) => messageController.markAllRead(req, res, io));
  router.get('/conversations/:id/unread-count', protect, messageController.unreadCount);

  return router;
};
