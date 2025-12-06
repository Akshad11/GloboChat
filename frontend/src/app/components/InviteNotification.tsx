"use client";

import { motion } from "framer-motion";

export default function InviteNotification({
    fromUser,
    onOpen,
}: {
    fromUser: string;
    onOpen: () => void;
}) {
    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="
                fixed top-24 right-4 z-[999]
                bg-gray-900 text-white px-4 py-3 
                rounded-xl shadow-xl border border-gray-800
                cursor-pointer
            "
            onClick={onOpen}
        >
            <p className="text-sm font-medium">New Chat Invite</p>
            <p className="text-xs text-gray-400">
                {fromUser} invited you
            </p>
        </motion.div>
    );
}
