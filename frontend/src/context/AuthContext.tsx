"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import api, { setAccessToken } from "@/lib/axios";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

type AuthContextType = {
    user: any | null;
    token: string | null;
    loading: boolean;
    register: (data: { username: string; email: string; password: string }) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    googleSignIn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);    // ✔ IMPORTANT
    const router = useRouter();

    // Prevent double calls due to React StrictMode
    const initialized = useRef(false);

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
                // Use axios not fetch → so interceptors work
                const { data } = await api.post("/auth/refresh", { refreshToken });

                // Set new tokens
                if (data.accessToken) {
                    setToken(data.accessToken);
                    setAccessToken(data.accessToken);
                }
                if (data.refreshToken) {
                    setCookie("refreshToken", data.refreshToken, { path: "/" });
                }

                // Load user profile after token is set
                const me = await api.get("/users/me");
                setUser(me.data);
            } catch (err) {
                deleteCookie("refreshToken");
                setUser(null);
                setToken(null);
            }

            setLoading(false);
        }

        loadAuth();
    }, []);

    // AUTH METHODS
    async function register(data: { username: string; email: string; password: string }) {
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

    async function logout() {
        try {
            const refreshToken = getCookie("refreshToken");
            if (refreshToken) await api.post("/auth/logout", { refreshToken });
        } catch (err) { }

        setUser(null);
        setToken(null);
        setAccessToken(null);
        deleteCookie("refreshToken");
        router.push("/login");
    }

    async function googleSignIn() {
        alert("Use Google button. Integrated in page.");
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, logout, googleSignIn }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
