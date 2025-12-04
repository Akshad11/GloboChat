"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setAccessToken } from "@/lib/axios";
import { setCookie } from "cookies-next";

export default function StepComplete({ form }: any) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function finishRegistration() {
            setLoading(true);

            try {
                let res;

                // GOOGLE REGISTER
                if (form.googleIdToken) {
                    res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                idToken: form.googleIdToken,
                                username: form.username,
                                firstname: form.firstname,
                                lastname: form.lastname
                            })
                        }
                    );
                } else {
                    // NORMAL EMAIL PASSWORD REGISTER
                    res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                username: form.username,
                                email: form.email,
                                password: form.password,
                                firstName: form.firstname,
                                lastName: form.lastname
                            })
                        }
                    );
                }

                const data = await res.json();

                if (!res.ok) return alert(data.message);

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
