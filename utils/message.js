const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const senderId = req.user._id;
        const receiverId = req.params.id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        res.status(200).json(newMessage);

    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    sendMessage
}