const http = require('http');
const { Server } = require('socket.io');
const express = require('express');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const getReceiverSocketId = (userId) => {
    return userSocketMap[userId];
}  

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId !== undefined) {
        userSocketMap[userId] = socket.id;
    }
    // emit is used to send events to the client.
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // socket.on is used to listen for events. can be used both on client and server.
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

module.exports = {
    app,
    server,
    io,
    getReceiverSocketId
}
