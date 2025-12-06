"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const s = getSocket();
        setSocket(s);

        return () => {

        };
    }, []);

    return socket;
}
