"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { useRouter } from "next/navigation";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { setAccessToken } from "@/lib/axios";
import Breadcrumb from "../components/Breadcrumb";


export default function ProfilePage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        setAccessToken(token);

        async function loadMe() {
            try {
                const res = await userService.getMe();
                const me = res.data;

                setUsername(me.username || "");
                setBio(me.bio || "");
                setAvatar(me.avatar || "");
            } catch (err) {
                console.error("Failed to load profile", err);
                router.push("/login");
            } finally {
                setPageLoading(false);
            }
        }

        loadMe();
    }, [token, router]);

    async function saveProfile() {
        setLoading(true);
        try {
            await userService.updateProfile({ username, bio, avatar });
            alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile!");
        } finally {
            setLoading(false);
        }
    }

    if (pageLoading) {
        return (
            <div className="h-screen flex items-center justify-center text-gray-500">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-800 text-white flex items-center justify-center px-4">

            <div className="w-full max-w-lg bg-gray-900 rounded-xl shadow-lg p-8">

                {/* Breadcrumb */}
                <Breadcrumb />

                {/* Header */}
                <h1 className="text-2xl font-semibold mb-6 text-gray-300">
                    Edit Profile
                </h1>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                    <img
                        src={
                            avatar ||
                            "https://ui-avatars.com/api/?background=random&name=" +
                            username
                        }
                        alt="avatar"
                        className="w-28 h-28 rounded-full border object-cover shadow"
                    />

                    <input
                        type="text"
                        placeholder="Avatar URL"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="mt-4 w-full p-2 border rounded-lg text-sm placeholder:text-gray-500"
                    />
                </div>

                {/* Username */}
                <div className="mb-4">
                    <label className="text-sm text-gray-300 mb-1 block">Username</label>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 border rounded-lg "
                    />
                </div>

                {/* Bio */}
                <div className="mb-6">
                    <label className="text-sm text-gray-300 mb-1 block">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full p-3 border rounded-lg min-h-[80px]"
                    />
                </div>

                {/* Save */}
                <button
                    onClick={saveProfile}
                    disabled={loading}
                    className={`w-full py-3 text-white rounded-lg transition ${loading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="mt-6 flex items-center justify-center gap-2 text-red-500 w-full py-2 hover:bg-red-100 rounded-lg"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}
