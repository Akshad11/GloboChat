import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getDBUserByID, PrintOnlineUsers } from "./helperfunctions.js";
import { createInviteData } from "../services/inviteService.js";

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

                        // console.log(`👤 User cached for socket ${socket.id}:`, entry.user);

                    }
                })
                .catch((err) => {
                    console.log(
                        "⚠️ User lookup failed for socket",
                        socket.id,
                        err.message
                    );
                });

            // console.log(`✅ Socket ${socket.id} registered for user ${userId}`);
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

        socket.on("inviteSent", async (data) => {
            try {
                const { fromUserId, inviteId, message, invitingTo } = data;

                // 1️⃣ Create or resolve invite
                const result = await createInviteData({
                    fromUserId,
                    inviteId,
                    message,
                    invitingTo,
                });

                // 2️⃣ Handle pending states
                if (result === "Pending") {
                    socket.emit("invitePending", {
                        message: "Invite is already pending",
                    });
                    return;
                }

                if (result === "PendingActionFromYou") {
                    socket.emit("invitePending", {
                        message: "You already have a pending invite from this user",
                    });
                    return;
                }

                // ✅ At this point: result = InviteID
                const inviteDbId = result._id;
                console.log("📝 Invite created:", inviteDbId);

                const targetEntry = getOnlineUserByInviteId(inviteId);

                if (!targetEntry) {
                    console.log("📦 Target user offline → invite stored in DB");
                    return;
                }

                console.log(targetEntry);
                // 5️⃣ Emit invite to all active sockets of target user
                for (const socketId of targetEntry) {
                    io.to(socketId).emit("inviteReceived", {
                        invite: result
                    });
                }

                console.log("📤 Invite sent to online user");

            } catch (err) {
                console.error("❌ Error handling inviteSent:", err.message);
                socket.emit("inviteError", {
                    message: err.message || "Failed to send invite",
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
    for (const [_, entry] of onlineUsers.entries()) {
        if (entry?.user?.inviteCode === inviteId) {
            return entry;
        }
    }
    return null;
}