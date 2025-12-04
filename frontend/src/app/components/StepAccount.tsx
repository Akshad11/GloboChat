"use client";

import { useEffect, useState } from "react";
import { setAccessToken } from "@/lib/axios";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export default function StepAccount({ next, update, form }: any) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // GOOGLE LOGIN SCRIPT
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
            initGoogle();
        };

        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    function initGoogle() {
        if (!(window as any).google) return;

        (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: async (res: any) => {
                update({ googleIdToken: res.credential });
                next();
            },
        });

        (window as any).google.accounts.id.renderButton(
            document.getElementById("google-register-btn"),
            { theme: "outline", size: "large", width: "100%" }
        );
    }

    function continueNext(e: any) {
        e.preventDefault();
        if (!form.email || !form.password)
            return alert("Email & password required");

        next();
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Create your account</h2>

            <form onSubmit={continueNext} className="space-y-4">
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update({ email: e.target.value })}
                    placeholder="Email"
                    className="w-full p-3 border rounded"
                />

                <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update({ password: e.target.value })}
                    placeholder="Password"
                    className="w-full p-3 border rounded"
                />

                <button
                    className="w-full p-3 bg-blue-600 text-white rounded"
                    type="submit"
                >
                    Continue
                </button>
            </form>

            <div className="text-center text-gray-500 py-3">or</div>

            <div id="google-register-btn" className="w-full"></div>
        </div>
    );
}
