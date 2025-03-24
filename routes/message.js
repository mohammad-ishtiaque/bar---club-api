const express = require('express');
// const { protect } = require('../utils/protect');
// const { Message } = require('../models/Message');
// const { Conversation } = require('../models/Conversation');
const { sendMessage } = require('../utils/message');

const router = express.Router();    

// Create a new conversation
router.post('/send/:id', sendMessage);

module.exports = router;

