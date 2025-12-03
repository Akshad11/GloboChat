"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/chat");
    else router.replace("/login");
  }, [user, router]);

  return <div className="p-8">Redirecting...</div>;
}
