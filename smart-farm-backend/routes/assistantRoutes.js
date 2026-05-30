const express = require('express');
const { chat } = require('../controllers/assistantController');

const router = express.Router();

// Streaming AI assistant (Server-Sent Events)
router.post('/chat', chat);

module.exports = router;
