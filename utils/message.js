const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

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

        // socket.io functionality
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            //io.to is used to send events to a specific client.
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(200).json(newMessage);

    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({ message: error.message });
    }
}


const getMessage = async (req, res) => {
    try {
        const { id : userToChatId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] }
        }).populate("messages");
        if(!conversation){
            return res.status(404).json({ message: "Conversation not found" });
        }

        const messages = conversation.messages;
        res.status(200).json(messages);
        
    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({ message: error.message });
    }
}


const getUsersForChat = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ 
            _id: { $ne: loggedInUserId },
            role: 'user'  // Only get users with role 'user'
        }).select("fullname email avatar");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getMessage,
    sendMessage,
    getUsersForChat
}