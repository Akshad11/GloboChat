"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { setAccessToken } from "@/lib/axios";
import { setCookie } from "cookies-next";

export default function RegisterPage() {
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    // Load Google script on mount
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
            initializeGoogle();
        };

        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const initializeGoogle = () => {
        if (!(window as any).google) return;

        (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: async (res: any) => {
                try {
                    // Send idToken to backend
                    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ idToken: res.credential })
                    });

                    const data = await r.json();

                    // Backend says user already exists?
                    if (r.status === 409 || data?.message === "User already exists") {
                        alert("Account already exists. Please login instead.");
                        router.push("/login");
                        return;
                    }

                    // Normal successful Google registration
                    setAccessToken(data.accessToken);
                    setCookie("refreshToken", data.refreshToken, { path: "/" });

                    window.location.href = "/chat";
                } catch (err) {
                    console.error("Google register failed", err);
                }
            }
        });

        (window as any).google.accounts.id.renderButton(
            document.getElementById("gsi-register-button"),
            { theme: "outline", size: "large", width: 300 }
        );
    };

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await register({ username, email, password });
            router.push("/chat");
        } catch (err: any) {
            alert(err?.message || "Register failed");
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-6 bg-white rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Create account</h2>

                <form onSubmit={submit} className="space-y-3">
                    <input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full p-2 border rounded"
                    />
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

                    <button className="w-full p-2 bg-green-600 text-white rounded">
                        Register
                    </button>
                </form>

                <div className="my-4 text-center">or</div>

                {/* Google Register Button */}
                <div id="gsi-register-button" className="flex justify-center"></div>

                <div className="mt-4 text-sm text-center">
                    Already have an account?{" "}
                    <a className="text-blue-600" href="/login">Login</a>
                </div>
            </div>
        </div>
    );
}
