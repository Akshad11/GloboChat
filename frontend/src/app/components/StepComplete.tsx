"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api, { setAccessToken } from "@/lib/axios";
import { setCookie } from "cookies-next";

export default function StepComplete({ form }: any) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const calledRef = useRef(false);

    useEffect(() => {
        if (calledRef.current) return;
        calledRef.current = true;

        async function finishRegistration() {
            setLoading(true);

            try {
                let res;

                // 🌐 GOOGLE REGISTER
                if (form.googleIdToken) {
                    res = await api.post("/auth/google", {
                        idToken: form.googleIdToken,
                        username: form.username,
                        firstName: form.firstname,
                        lastName: form.lastname,
                    });
                }
                // ✉️ NORMAL EMAIL/PASSWORD REGISTER
                else {
                    res = await api.post("/auth/register", {
                        username: form.username,
                        email: form.email,
                        password: form.password,
                        firstName: form.firstname,
                        lastName: form.lastname,
                    });
                }
                const data = res.data;

                // Save tokens
                setAccessToken(data.accessToken);
                setCookie("refreshToken", data.refreshToken);

                router.push("/chat");

            } catch (err) {
                console.error("Registration error:", err);
                alert("Error creating account");
            }

            setLoading(false);
        }

        finishRegistration();
    }, []);

    return (
        <div className="text-center">
            {loading ? (
                <p className="text-gray-600">Creating your account...</p>
            ) : (
                <h2 className="text-xl font-semibold">Welcome!</h2>
            )}
        </div>
    );
}
