"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "../lib/axios";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

type AuthContextType = {
    user: any | null;
    token: string | null;
    register: (data: { username: string; email: string; password: string }) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    googleSignIn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // On mount, try to fetch refresh token and get access token
        const refreshToken = getCookie("refreshToken") as string | undefined;
        if (refreshToken) {
            (async () => {
                try {
                    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refreshToken })
                    });
                    if (resp.ok) {
                        const data = await resp.json();
                        setToken(data.accessToken);
                        setAccessToken(data.accessToken);
                        if (data.refreshToken) setCookie("refreshToken", data.refreshToken, { path: "/" });
                        // fetch profile
                        const me = await api.get("/users/me");
                        setUser(me.data);
                    } else {
                        deleteCookie("refreshToken");
                    }
                } catch (err) {
                    deleteCookie("refreshToken");
                }
            })();
        }
    }, []);

    async function register(data: { username: string; email: string; password: string }) {
        const resp = await api.post("/auth/register", data);
        const { accessToken, refreshToken, user } = resp.data;
        setToken(accessToken);
        setAccessToken(accessToken);
        if (refreshToken) setCookie("refreshToken", refreshToken, { path: "/" });
        setUser(user);
    }

    async function login(email: string, password: string) {
        console.log("AuthContext login called with", email, password);
        const resp = await api.post("/auth/login", { email, password });
        const { accessToken, refreshToken, user } = resp.data;
        setToken(accessToken);
        setAccessToken(accessToken);
        if (refreshToken) setCookie("refreshToken", refreshToken, { path: "/" });
        setUser(user);
    }

    async function logout() {
        try {
            const refreshToken = getCookie("refreshToken") as string | undefined;
            if (refreshToken) {
                await api.post("/auth/logout", { refreshToken });
            }
        } catch (err) {
            console.warn("logout failed", err);
        } finally {
            setToken(null);
            setUser(null);
            setAccessToken(null);
            deleteCookie("refreshToken");
            router.push("/login");
        }
    }

    // Google Identity integration: open popup and get id token from google client library
    async function googleSignIn() {
        // Use Google Identity Services to get id_token — this function expects the global google variable
        // For simplicity here we'll open a popup that calls backend /api/auth/google with idToken
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            alert("GOOGLE_CLIENT_ID not set in .env.local");
            return;
        }

        // open Google's One Tap or OAuth popup — simplest: open a new window to perform client-side prompt
        // In a production app you would integrate the Google Identity Services button, then call backend with idToken.
        // Here we'll open a popup hinting the developer to implement Google on the client.
        alert("Please use the Google Sign-In button. If you want full integration, include the GSI script and call google.accounts.id.initialize in a client component.");
        // Implementation note: the app's login page already has a 'Sign in with Google' button — implement GSI there.
    }

    return (
        <AuthContext.Provider value={{ user, token, register, login, logout, googleSignIn }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
