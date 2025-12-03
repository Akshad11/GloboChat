import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export function initSocketServer(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Middleware: Authenticate socket using JWT
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("No token provided"));

            const payload = verifyAccessToken(token);
            socket.userId = payload.sub;

            next();
        } catch (err) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("🔌 User connected:", socket.userId);

        // Join conversation rooms
        socket.on("join_conversation", (conversationId) => {
            console.log(`User ${socket.userId} joined conversation ${conversationId}`);
            socket.join(conversationId);
        });

        // Typing indicator
        socket.on("typing", (conversationId) => {
            socket.to(conversationId).emit("typing", {
                userId: socket.userId,
                conversationId
            });
        });

        // Send message
        socket.on("send_message", async (data) => {
            const { conversationId, content } = data;

            const message = await Message.create({
                conversationId,
                senderId: socket.userId,
                content,
                type: "text",
            });

            // Broadcast to everyone in the room
            io.to(conversationId).emit("new_message", {
                _id: message._id,
                conversationId,
                senderId: socket.userId,
                content,
                createdAt: message.createdAt
            });
        });

        socket.on("disconnect", () => {
            console.log("🔌 User disconnected:", socket.userId);
        });
    });

    return io;
}
