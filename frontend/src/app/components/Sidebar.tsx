"use client";

import { XMarkIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import ChatListItem from "./ChatListItem";

export default function ChatSidebar({ onClose }: { onClose: () => void }) {

    // Fake sample data
    const conversations = [
        {
            id: 1,
            name: "Akshad",
            avatar: "https://ui-avatars.com/api/?name=A",
            lastMessage: "Hey, what's up?",
            time: "3:45 PM",
            online: true
        },
        {
            id: 2,
            name: "Rahul",
            avatar: "https://ui-avatars.com/api/?name=R",
            lastMessage: "Let's meet tomorrow.",
            time: "12:10 PM",
            online: false
        },
        {
            id: 3,
            name: "Group Chat",
            avatar: "https://ui-avatars.com/api/?name=G",
            lastMessage: "New updates available!",
            time: "Yesterday",
            online: true
        },
    ];

    const [search, setSearch] = useState("");
    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-gray-800 text-white border-r border-gray-700 shadow-xl relative">

            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chats</h2>

                <button
                    className="sm:hidden p-2 hover:bg-gray-700 rounded-lg"
                    onClick={onClose}
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 border-b border-gray-700 bg-[#1a1d21]">
                <div className="flex items-center gap-2 bg-[#2A2D31] p-2 rounded-lg">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search chats..."
                        className="bg-transparent outline-none flex-1 text-sm text-gray-200"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                {filteredConversations.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                        No chats found.
                    </div>
                ) : (
                    filteredConversations.map((c) => (
                        <ChatListItem
                            key={c.id}
                            avatar={c.avatar}
                            name={c.name}
                            lastMessage={c.lastMessage}
                            time={c.time}
                            online={c.online}
                            onClick={() => console.log("Open chat", c.id)}
                        />
                    ))
                )}
            </div>

            {/* FLOATING ADD BUTTON */}
            <button
                className="
                    absolute bottom-6 right-6 p-4 rounded-full shadow-lg
                    bg-gradient-to-r from-[#8BEAFF] to-[#FFE29F]
                    text-black hover:scale-110 transition-transform
                    active:scale-95 z-50
                "
                onClick={() => console.log("Open create chat modal")}
            >
                <PlusIcon className="w-6 h-6" />
            </button>
        </div>
    );
}
