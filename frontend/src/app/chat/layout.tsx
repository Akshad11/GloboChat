"use client";

import { useState } from "react";
import IconSidebar from "../components/IconSidebar";
import ChatSidebar from "../components/Sidebar";


export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const [showChats, setShowChats] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-100">

            {/* Left Icon Sidebar (always visible) */}
            <div className="w-20 bg-gray-900 text-white shrink-0">
                <IconSidebar onToggleChats={() => setShowChats(true)} />
            </div>

            {/* Conversation Sidebar */}
            <div
                className={`bg-white border-r h-full transition-all duration-300 
                fixed sm:static top-0 left-0 w-72 sm:w-90 z-50 
                ${showChats ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
            `}
            >
                <ChatSidebar onClose={() => setShowChats(false)} />
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
