"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type StepCompleteProps = {
    form: {
        username: string;
        email?: string;
        password?: string;
        firstname: string;
        lastname: string;
        googleIdToken?: string;
    };
};

export default function StepComplete({ form }: StepCompleteProps) {
    const router = useRouter();
    const { register, googleSignIn } = useAuth();

    const [loading, setLoading] = useState(true);
    const calledRef = useRef(false);

    useEffect(() => {
        if (calledRef.current) return;
        calledRef.current = true;

        async function finishRegistration() {
            try {
                setLoading(true);

                if (form.googleIdToken) {
                    await googleSignIn(form.googleIdToken, {
                        username: form.username,
                        firstName: form.firstname,
                        lastName: form.lastname,
                    });
                }
                else {
                    await register({
                        username: form.username,
                        email: form.email!,
                        password: form.password!,
                        firstName: form.firstname,
                        lastName: form.lastname,
                    } as any); // adjust type if needed
                }

                router.replace("/chat");
            } catch (err) {
                console.error("Registration error:", err);
                alert("Error creating account");
            } finally {
                setLoading(false);
            }
        }

        finishRegistration();
    }, [form, register, googleSignIn, router]);

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {loading ? (
                <>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                    <p className="text-gray-600">
                        Creating your account...
                    </p>
                </>
            ) : (
                <h2 className="text-xl font-semibold">Welcome aboard 🎉</h2>
            )}
        </div>
    );
}
