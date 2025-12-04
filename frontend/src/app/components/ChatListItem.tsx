"use client";
import React from "react";

export default function ChatListItem({
    avatar,
    name,
    lastMessage,
    time,
    online,
    onClick
}: {
    avatar: string;
    name: string;
    lastMessage: string;
    time: string;
    online?: boolean;
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="
                flex items-center justify-between px-4 py-3 cursor-pointer 
                hover:bg-[#1f2225] transition border-b border-gray-800
            "
        >
            {/* Left */}
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="relative shrink-0">
                    <img
                        src={avatar}
                        className="w-12 h-12 rounded-full object-cover"
                    />

                    {online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                    )}
                </div>

                {/* Text Section */}
                <div className="min-w-0">
                    <p className="font-medium text-white truncate max-w-[180px]">
                        {name}
                    </p>

                    <p className="
                        text-gray-400 text-sm truncate max-w-[180px]
                    ">
                        {lastMessage}
                    </p>
                </div>
            </div>

            {/* Time */}
            <p className="text-gray-500 text-xs whitespace-nowrap pl-2 shrink-0">
                {time}
            </p>
        </div>
    );
}
