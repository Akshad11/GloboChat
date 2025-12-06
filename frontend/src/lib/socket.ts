import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(accessToken: string) {
    if (socket) return socket;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        auth: {
            token: accessToken,
        },
        transports: ["websocket"],
    });

    socket.on("connect", () => {
        console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
    });

    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
