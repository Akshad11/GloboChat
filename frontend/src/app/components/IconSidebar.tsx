"use client";
import { useState } from "react";
import {
    ClockIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    Squares2X2Icon,
    UserCircleIcon,
    ArrowLeftOnRectangleIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function IconSidebar({
    onToggleChats,
}: {
    onToggleChats: () => void;
}) {
    const [active, setActive] = useState("recent");
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();
    const { logout } = useAuth();

    const menuItems = [
        {
            id: "recent",
            label: "Recent Chats",
            icon: ClockIcon,
            onClick: () => router.push("/chat"),
        },
        {
            id: "p_chats",
            label: "P Chats",
            icon: ChatBubbleLeftRightIcon,
            onClick: () => router.push("/chat/p-chats"),
        },
        {
            id: "g_chats",
            label: "G Chats",
            icon: UserGroupIcon,
            onClick: () => router.push("/chat/g-chats"),
        },
        {
            id: "a_chats",
            label: "A Chats",
            icon: Squares2X2Icon,
            onClick: () => router.push("/chat/a-chats"),
        },
    ];

    return (
        <div className="flex flex-col h-full items-center justify-between bg-gray-900 text-white py-4 w-20">

            {/* ----- Top Section (Clickable Icons) ----- */}
            <div className="flex flex-col items-center gap-6">

                {/* Mobile: Open Chat List */}
                <button
                    onClick={onToggleChats}
                    className="sm:hidden p-3 rounded-lg bg-gray-800 hover:bg-gray-700"
                >
                    <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
                </button>

                {/* Desktop Icons */}
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActive(item.id);
                                item.onClick();
                            }}
                            title={item.label}
                            className={`p-3 rounded-xl transition ${active === item.id
                                ? "bg-blue-600"
                                : "hover:bg-gray-700"
                                }`}
                        >
                            <Icon className="w-7 h-7" />
                        </button>
                    );
                })}
            </div>

            {/* ----- Bottom Profile Section ----- */}
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-full hover:bg-gray-700"
                >
                    <UserCircleIcon className="w-10 h-10" />
                </button>

                {showMenu && (
                    <div className="absolute bottom-14 bg-gray-800 text-white rounded-lg shadow-lg w-40 py-2 animate-fade-in left-1/2 -translate-x-1/2">
                        <button
                            onClick={() => router.push("/profile")}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                        >
                            <Cog6ToothIcon className="w-5 h-5" />
                            Profile
                        </button>

                        <button
                            onClick={logout}
                            className="w-full text-left px-4 py-2 hover:bg-red-600 flex items-center gap-2 text-red-400"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
