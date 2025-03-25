const express = require('express');
const { protect } = require('../utils/protect');
// const { Message } = require('../models/Message');
// const { Conversation } = require('../models/Conversation');
const { sendMessage, getMessage } = require('../utils/message');

const router = express.Router();    


router.get('/:id', protect,  getMessage);

// Create a new conversation
router.post('/send/:id',protect,  sendMessage);

module.exports = router;

