const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation');

const app = express();

/*** Socket connection setup ***/
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

// Online users set
const onlineUser = new Set();

io.on('connection', async (socket) => {
    console.log("User connected: ", socket.id);

    const token = socket.handshake.auth.token;

    // Validate token
    if (!token) {
        console.log("No token provided, disconnecting...");
        return socket.disconnect();
    }

    // Get user details
    let user;
    try {
        user = await getUserDetailsFromToken(token);
    } catch (error) {
        console.error("Error fetching user details:", error);
        return socket.disconnect();
    }

    // Handle case where user is not found
    if (!user || !user?._id) {
        console.log("Invalid token or user not found, disconnecting...");
        return socket.disconnect();
    }

    // Join user to their socket room
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());

    // Notify all users about the updated online users list
    io.emit('onlineUser', Array.from(onlineUser));

    // Handle fetching user messages
    socket.on('message-page', async (userId) => {
        console.log('Fetching messages for userId:', userId);

        try {
            const userDetails = await UserModel.findById(userId).select("-password");

            const payload = {
                _id: userDetails?._id,
                name: userDetails?.name,
                email: userDetails?.email,
                profile_pic: userDetails?.profile_pic,
                online: onlineUser.has(userId)
            };
            socket.emit('message-user', payload);

            // Fetch previous messages
            const getConversationMessage = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: userId },
                    { sender: userId, receiver: user._id }
                ]
            }).populate('messages').sort({ updatedAt: -1 });

            socket.emit('message', getConversationMessage?.messages || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    });

    // Handle new messages
    socket.on('new message', async (data) => {
        try {
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender }
                ]
            });

            // Create a new conversation if not found
            if (!conversation) {
                const createConversation = new ConversationModel({
                    sender: data?.sender,
                    receiver: data?.receiver
                });
                conversation = await createConversation.save();
            }

            // Save the message
            const message = new MessageModel({
                text: data.text,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                msgByUserId: data?.msgByUserId,
            });

            const saveMessage = await message.save();

            // Update conversation with new message
            await ConversationModel.updateOne({ _id: conversation?._id }, {
                "$push": { messages: saveMessage?._id }
            });

            // Fetch updated conversation messages
            const getConversationMessage = await ConversationModel.findOne({
                "$or": [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender }
                ]
            }).populate('messages').sort({ updatedAt: -1 });

            // Send updated messages to both users
            io.to(data?.sender).emit('message', getConversationMessage?.messages || []);
            io.to(data?.receiver).emit('message', getConversationMessage?.messages || []);

            // Send updated conversation lists
            const conversationSender = await getConversation(data?.sender);
            const conversationReceiver = await getConversation(data?.receiver);

            io.to(data?.sender).emit('conversation', conversationSender);
            io.to(data?.receiver).emit('conversation', conversationReceiver);
        } catch (error) {
            console.error("Error handling new message:", error);
        }
    });

    // Handle fetching conversation list for sidebar
    socket.on('sidebar', async (currentUserId) => {
        console.log("Fetching sidebar conversations for user:", currentUserId);

        try {
            const conversation = await getConversation(currentUserId);
            socket.emit('conversation', conversation);
        } catch (error) {
            console.error("Error fetching sidebar conversation:", error);
        }
    });

    // Handle message seen status
    socket.on('seen', async (msgByUserId) => {
        try {
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: msgByUserId },
                    { sender: msgByUserId, receiver: user._id }
                ]
            });

            const conversationMessageId = conversation?.messages || [];

            await MessageModel.updateMany(
                { _id: { "$in": conversationMessageId }, msgByUserId: msgByUserId },
                { "$set": { seen: true } }
            );

            // Send updated conversation list
            const conversationSender = await getConversation(user._id.toString());
            const conversationReceiver = await getConversation(msgByUserId);

            io.to(user._id.toString()).emit('conversation', conversationSender);
            io.to(msgByUserId).emit('conversation', conversationReceiver);
        } catch (error) {
            console.error("Error marking messages as seen:", error);
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        onlineUser.delete(user._id?.toString());
        console.log('User disconnected:', socket.id);
        io.emit('onlineUser', Array.from(onlineUser));
    });
});

module.exports = {
    app,
    server
};
