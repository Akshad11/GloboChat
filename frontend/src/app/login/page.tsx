"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const { login, googleSignIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = initializeGoogleLogin;
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);


    function initializeGoogleLogin() {
        if (!(window as any).google) return;

        (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: async (res: any) => {
                try {
                    await googleSignIn(res.credential);
                    router.replace("/chat");
                } catch (err) {
                    console.error("Google login failed", err);
                    alert("Google login failed");
                }
            }
        });

        (window as any).google.accounts.id.renderButton(
            document.getElementById("gsi-button"),
            { theme: "outline", size: "large", width: 300 }
        );
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            router.replace("/chat");
        } catch (err: any) {
            alert(err?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
            <div className="w-full max-w-md p-6 bg-gray-900 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Login</h2>

                <form onSubmit={submit} className="space-y-3">
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    />
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    />

                    <button
                        disabled={loading}
                        className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 transition"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="my-4 text-center text-gray-400">or</div>

                {/* Google Button */}
                <div id="gsi-button" className="flex justify-center"></div>

                <p className="mt-4 text-sm text-center">
                    Don't have an account?{" "}
                    <a href="/register" className="text-blue-500">Register</a>
                </p>
            </div>
        </div>
    );
}
