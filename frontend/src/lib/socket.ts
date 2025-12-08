
import { s } from "framer-motion/client";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let registeredUserId: string | null = null;

export function connectSocket(accessToken: string) {
    if (socket && socket.connected) return socket;

    if (socket) {
        socket.disconnect();
        socket = null;
    }

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        auth: { token: accessToken },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
    });

    socket.on("user:connected", () => {
        console.log("✅ Socket connected:", socket?.id);

    });

    socket.on('user:refresh', () => {
        console.log("🔄 Socket user refresh requested");

    });
    socket.on("socket:user", (data) => {
        console.log("🏓 OnlineUser received:", data);
    });

    socket.on("invitePending", (data) => {
        console.log("⚠️ Invite is already pending:", data);
    });

    // socket.on("inviteReceived", (data) => {
    //     console.log("📥 Invite received:", data);
    //     console.log("From user:", data.fromUserId);
    // });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error.message);
    });

    return socket;
}

/* ✅ USER REGISTRATION IS SEPARATE */
export function registerSocketUser(user: any) {
    if (!socket || !socket.connected || !user) return;

    if (registeredUserId === user._id) return;

    registeredUserId = user._id;

    console.log("🔐 Registering user with socket", user._id);
    socket.emit("register", {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        firstName: user.name,
        lastName: user.lastName,
        inviteCode: user.inviteCode,
    });
}

export function sendPrivateInvite(
    fromUserId: string,
    inviteId: string,
    message?: string
) {
    if (!socket || !socket.connected) return;

    console.log("📤 Emitting inviteSent event to socket server", { fromUserId, inviteId, message });
    socket.emit("inviteSent", {
        fromUserId,
        inviteId,
        message,
        invitingTo: "private",
        targetModel: "Conversation",
    });
}

export function emitTest() {
    if (!socket || !socket.connected) {
        console.warn("Socket not connected. Cannot emit test event.");
        return;
    }
    socket.emit("test");
}

export function disconnectSocket() {
    socket?.disconnect();
    socket = null;
    registeredUserId = null;
}

export function getSocket() {
    return socket;
}
