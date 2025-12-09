"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { PendingInvite } from "@/types";

type SocketEventContextType = {
    invites: PendingInvite[];
    clearInvites: () => void;
    removeInviteById: (inviteId: string) => void;
};

const SocketEventContext = createContext<SocketEventContextType>(
    {} as SocketEventContextType
);

const notificationSound =
    typeof window !== "undefined"
        ? new Audio("/sounds/notify.wav")
        : null;


export function SocketEventProvider({ children }: { children: React.ReactNode }) {
    const [invites, setInvites] = useState<PendingInvite[]>([]);
    const clearInvites = () => setInvites([]);

    const removeInviteById = (inviteId: string) => {
        setInvites(prev =>
            prev.filter(invite => invite._id !== inviteId)
        );
        console.log(invites.length, invites)
    };

    useEffect(() => {
        let socket: any;
        let interval: NodeJS.Timeout | null = null;

        const handler = (invite: PendingInvite) => {
            console.log("📥 Invite received:", invite);
            notificationSound?.play().catch(() => {
                console.log("🔇 Autoplay blocked until user interacts");
            });
            setInvites((prev) => [invite, ...prev]);
        };

        const attach = () => {
            socket = getSocket();
            if (!socket) return;

            socket.off("inviteReceived", handler); // ✅ prevent duplicate
            socket.on("inviteReceived", handler);
        };

        socket = getSocket();

        if (!socket) {
            interval = setInterval(() => {
                socket = getSocket();
                if (socket) {
                    attach();
                    if (interval) clearInterval(interval);
                }
            }, 300);
        } else {
            attach();
        }

        // ✅ CLEANUP
        return () => {
            if (interval) clearInterval(interval);
            if (socket) {
                socket.off("inviteReceived", handler);
            }
        };
    }, []);

    return (
        <SocketEventContext.Provider value={{ invites, clearInvites, removeInviteById }}>
            {children}
        </SocketEventContext.Provider>
    );
}

export function useSocketEvents() {
    return useContext(SocketEventContext);
}
