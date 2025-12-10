"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import api, { setAccessToken } from "@/lib/axios";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { connectSocket, disconnectSocket, emitTest, registerSocketUser } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { PendingInvite, PendingReceivedInvitesResponse, PendingSentInvitesResponse } from "@/types";

type AuthContextType = {
    user: any | null;
    invitesReceived: PendingInvite[];
    invitesSent: PendingInvite[];
    token: string | null;
    loading: boolean;
    register: (data: {
        username: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    googleSignIn: (
        idToken: string,
        userData?: { username: string; firstName: string; lastName: string }
    ) => Promise<void>;
    loadInvites: () => Promise<void>;
    removeInviteByIdFromReceivedAndSent: (type: "RECEIVED" | "SENT", id: String) => void;
    sendPrivateInvite: (touserInviteCode: string, message?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [invitesReceived, setInvitesReceived] = useState<PendingInvite[]>([]);
    const [invitesSent, setInvitesSent] = useState<PendingInvite[]>([]);
    const router = useRouter();
    const initialized = useRef(false);

    /* ===============================
       INITIAL LOAD (REFRESH TOKEN)
    =============================== */
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        async function loadAuth() {
            const refreshToken = getCookie("refreshToken");
            if (!refreshToken) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await api.post("/auth/refresh", { refreshToken });

                if (data.accessToken) {
                    setToken(data.accessToken);
                    setAccessToken(data.accessToken);
                }

                if (data.refreshToken) {
                    setCookie("refreshToken", data.refreshToken, { path: "/" });
                }

                const me = await api.get("/users/me");
                setUser(me.data);
            } catch (err) {
                deleteCookie("refreshToken");
                setUser(null);
                setToken(null);
                setAccessToken(null);
            } finally {
                setLoading(false);
            }
        }

        loadAuth();
    }, []);

    /* ===============================
       SOCKET RECONNECT ON TOKEN CHANGE ✅
    =============================== */
    useEffect(() => {
        if (!token) return;

        console.log("🔄 Reconnecting socket due to token change");
        connectSocket(token);
    }, [token]);

    useEffect(() => {
        if (!user) return;
        registerSocketUser(user);
    }, [user]);

    useEffect(() => {
        if (Socket && user) {
            loadInvites();
        }
    }, [user]);

    /* ===============================
       AUTH FUNCTIONS
    =============================== */

    async function loadInvites() {
        try {

            const res = await api.get<PendingReceivedInvitesResponse>("/invites/pending");

            if (res.data.invites.length > 0) {
                setInvitesReceived(res.data.invites);
            }

            const res2 = await api.get<PendingSentInvitesResponse>("/invites/pendingsent");

            if (res2.data.invites.length > 0) {
                setInvitesSent(res2.data.invites);
            }

        } catch (err) {
            console.error("Failed to load pending invites", err);
        }
    }

    function removeInviteByIdFromReceivedAndSent(type: 'RECEIVED' | 'SENT', id: String) {
        if (type === "RECEIVED") {
            setInvitesReceived(prev =>
                prev.filter(inv => inv._id !== id)
            );
        } else {
            setInvitesSent(prev =>
                prev.filter(inv => inv._id !== id)
            );
        }
    }

    async function register(data: {
        username: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) {
        const resp = await api.post("/auth/register", data);
        const { accessToken, refreshToken, user } = resp.data;

        setToken(accessToken);
        setAccessToken(accessToken);
        if (refreshToken) setCookie("refreshToken", refreshToken, { path: "/" });
        setUser(user);
    }

    async function login(email: string, password: string) {
        const resp = await api.post("/auth/login", { email, password });
        const { accessToken, refreshToken, user } = resp.data;
        setToken(accessToken);
        setAccessToken(accessToken);
        if (refreshToken) setCookie("refreshToken", refreshToken, { path: "/" });
        setUser(user);
    }

    async function googleSignIn(
        idToken: string,
        userData?: { username: string; firstName: string; lastName: string }
    ) {
        const resp = await api.post("/auth/google", {
            idToken,
            ...userData,
        });

        const { accessToken, refreshToken, user } = resp.data;
        setToken(accessToken);
        setAccessToken(accessToken);
        if (refreshToken) setCookie("refreshToken", refreshToken, { path: "/" });
        setUser(user);
    }

    async function sendPrivateInvite(touserInviteCode: string, message?: string) {
        await api.post("/invites/send", {
            touserInviteCode,
            invitingTo: "private",
            targetId: null,
            targetModel: "Conversation",
            message,
            expiresAt: null,
        });
    }

    async function logout() {
        try {
            const refreshToken = getCookie("refreshToken");
            if (refreshToken) await api.post("/auth/logout", { refreshToken });
        } catch { }

        disconnectSocket();
        setUser(null);
        setToken(null);
        setAccessToken(null);
        deleteCookie("refreshToken");
        router.push("/login");
    }

    return (
        <AuthContext.Provider
            value={{ user, token, loading, register, login, logout, googleSignIn, sendPrivateInvite, invitesReceived, invitesSent, loadInvites, removeInviteByIdFromReceivedAndSent }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
