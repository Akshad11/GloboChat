import { Server } from "socket.io";

const onlineUsers = new Map();

let io;

export function initSocketServer(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("🔌 Socket connected:", socket.id);

        socket.on("register", (userId) => {
            userId = userId.toString();

            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
            }

            onlineUsers.get(userId).add(socket.id);

            console.log(
                `✅ User ${userId} registered with socket ${socket.id}`
            );
        });

        socket.on("disconnect", () => {
            console.log("❌ Socket disconnected:", socket.id);

            for (const [userId, sockets] of onlineUsers.entries()) {
                sockets.delete(socket.id);

                if (sockets.size === 0) {
                    onlineUsers.delete(userId);
                }
            }
        });
    });

    console.log("✅ Socket.IO initialized");
}

// 🔥 helper to emit to all active sockets of a user
export function emitToUser(userId, event, payload) {
    if (!io) return;

    const sockets = onlineUsers.get(userId?.toString());
    if (!sockets) return;

    for (const socketId of sockets) {
        io.to(socketId).emit(event, payload);
    }
}

// Optional: broadcast helpers
export function emitToUsers(userIds = [], event, payload) {
    userIds.forEach((uid) => emitToUser(uid, event, payload));
}
