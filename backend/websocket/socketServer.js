import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getDBUserByID, PrintOnlineUsers } from "./helperfunctions.js";

const onlineUsers = new Map();
// userId -> Set(socketIds)

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

        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                console.log("❌ No auth token, disconnecting");
                return socket.disconnect();
            }

            const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            socket.userId = payload.sub;

            const userId = socket.userId.toString();
            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
            }
            onlineUsers.get(userId).add(socket.id);
            getDBUserByID(userId)
                .then((user) => {
                    if (user) {
                        const entry = onlineUsers.get(userId);
                        if (!entry) return;

                        entry.user = {
                            id: user._id.toString(),
                            username: user.username,
                            email: user.email,
                            name: user.name,
                            firstname: user.name,
                            lastname: user.lastName,
                            inviteCode: user.inviteCode,
                        };

                        console.log(`👤 User cached for socket ${socket.id}:`, entry.user);

                    }
                })
                .catch((err) => {
                    console.log(
                        "⚠️ User lookup failed for socket",
                        socket.id,
                        err.message
                    );
                });

            console.log(`✅ Socket ${socket.id} registered for user ${userId}`);
        } catch (err) {
            console.log("❌ Invalid token", err.message);
            socket.disconnect();
        }

        socket.emit("user:connected", { socketId: socket.id });

        socket.on("register", (user) => {
            if (!user || !user.id) {
                console.log("⚠️ Invalid socket register payload:", user);
                return;
            }

            const userId = user.id.toString();

            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
            }

            onlineUsers.get(userId).add(socket.id);
            console.log(`✅ User ${user.username} (${userId}) registered`);
        });

        // socket.onAny((event, ...args) => {
        //     console.log("📩 Event received:", event, args);
        // });

        socket.on("test", () => {
            console.log("📩 Test event received from socket:", socket.id);
            PrintOnlineUsers('test-event', onlineUsers)
            socket.emit("socket:user", getOnlineUser(socket.id));
        });

        socket.on("inviteSent", (data) => {
            const { fromUserId, inviteId, message } = data;

            const toUser = getOnlineUserByInviteId(inviteId);
            console.log(
                `📨 Invite from ${fromUserId} to ${toUser.id} (inviteId: ${inviteId})`
            );

            const targetSockets = onlineUsers.get(toUserId?.toString());

            if (!targetSockets || targetSockets.size === 0) {
                console.log("⚠️ Target user is offline");
                return;
            }

            for (const socketId of targetSockets) {
                io.to(socketId).emit("inviteReceived", {
                    fromUserId,
                    inviteId,
                    message,
                });
            }
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

// helpers
export function emitToUser(userId, event, payload) {
    const sockets = onlineUsers.get(userId?.toString());
    if (!sockets) return;

    for (const socketId of sockets) {
        io.to(socketId).emit(event, payload);
    }
}

export function emitToUsers(userIds, event, payload) {
    userIds.forEach((id) => emitToUser(id, event, payload));
}

export function getOnlineUser(socketId) {
    for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socketId)) {
            return userId;
        }
    }
    return null;
}

export function getOnlineUserByInviteId(inviteId) {
    for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(inviteId)) {
            return userId;
        }
    }
    return null;
}