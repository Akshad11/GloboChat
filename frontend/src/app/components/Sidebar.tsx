"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

export default function ChatSidebar({
    onClose,
}: {
    onClose: () => void;
}) {

    return (
        <div className="flex flex-col h-full bg-white border-r shadow-lg">

            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white">
                <h2 className="text-lg font-semibold">Chats</h2>

                {/* Mobile Close Button */}
                <button
                    className="sm:hidden p-2 hover:bg-gray-200 rounded-lg"
                    onClick={onClose}
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-auto">
                {/* {conversations.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                        No chats yet.
                    </div>
                ) : (
                    conversations.map((c) => (
                        <ConversationItem conversation={c} key={c._id} />
                    ))
                )} */}
            </div>
        </div>
    );
}
