"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

type Invite = {
    [key: string]: any;
};

type SocketEventContextType = {
    invites: Invite[];
};

const SocketEventContext = createContext<SocketEventContextType>(
    {} as SocketEventContextType
);

export function SocketEventProvider({ children }: { children: React.ReactNode }) {
    const [invites, setInvites] = useState<Invite[]>([]);

    useEffect(() => {
        let socket = getSocket();

        if (!socket) {
            // wait until socket exists
            const interval = setInterval(() => {
                socket = getSocket();
                if (socket) {
                    clearInterval(interval);
                    attach(socket);
                }
            }, 300);

            return () => clearInterval(interval);
        }

        attach(socket);

        function attach(sock: any) {
            const handler = (invite: Invite) => {
                console.log("📥 Invite received:", invite);
                setInvites((prev) => [invite, ...prev]);
            };

            sock.on("inviteReceived", handler);

            return () => {
                sock.off("inviteReceived", handler);
            };
        }
    }, []);

    return (
        <SocketEventContext.Provider value={{ invites }}>
            {children}
        </SocketEventContext.Provider>
    );
}

export function useSocketEvents() {
    return useContext(SocketEventContext);
}
