const express = require('express');
const { protect } = require('../utils/protect');
// const { Message } = require('../models/Message');
// const { Conversation } = require('../models/Conversation');
const { sendMessage, getMessage, getUsersForChat } = require('../utils/message');

const router = express.Router();    


router.get('/get-messages/:id', protect,  getMessage);

// Create a new conversation
router.post('/send-message/:id',protect,  sendMessage);

router.get('/user-to-chat/', protect, getUsersForChat);

module.exports = router;

