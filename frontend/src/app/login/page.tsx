"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { setAccessToken } from "@/lib/axios";
import { setCookie } from "cookies-next";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Load Google Script only once
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
            initializeGoogleLogin();
        };

        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // Initialize Google button after script loads
    const initializeGoogleLogin = () => {
        if (!(window as any).google) return;

        (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: async (res: any) => {
                try {
                    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ idToken: res.credential })
                    });

                    const data = await r.json();

                    // Save tokens
                    setAccessToken(data.accessToken);
                    setCookie("refreshToken", data.refreshToken, { path: "/" });

                    window.location.href = "/chat";
                } catch (err) {
                    console.error("Google login failed:", err);
                }
            }
        });

        (window as any).google.accounts.id.renderButton(
            document.getElementById("gsi-button"),
            { theme: "outline", size: "large", width: 300 }
        );
    };

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            router.push("/chat");
        } catch (err: any) {
            alert(err?.message || "Login failed");
        } finally { setLoading(false); }
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-6 bg-white rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Login</h2>
                <form onSubmit={submit} className="space-y-3">
                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        className="w-full p-2 border rounded"
                    />

                    <button
                        disabled={loading}
                        className="w-full p-2 bg-blue-600 text-white rounded"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="my-4 text-center">or</div>

                {/* Google Sign-in Button Container */}
                <div id="gsi-button" className="w-full flex justify-center"></div>

                <div className="mt-4 text-sm">
                    Don't have an account?{" "}
                    <a className="text-blue-600" href="/register">Register</a>
                </div>
            </div>
        </div>
    );
}
