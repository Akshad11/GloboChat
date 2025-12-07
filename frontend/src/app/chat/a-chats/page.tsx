"use client";
import { emitTest } from "@/lib/socket";

export default function AChatsPage() {
    return (
        <div className="h-full flex items-center justify-center flex-col gap-4">
            <h1 className="text-gray-700 text-xl">All Chats</h1>
            <button className="text-black bg-blue-400"
                onClick={() => {
                    emitTest();
                    console.log("Test event emitted");
                }}
            >
                Test Socket

            </button>
        </div >
    );
}