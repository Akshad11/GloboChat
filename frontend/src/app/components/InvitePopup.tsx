"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ClipboardIcon, ShareIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

export default function InvitePopup({
    onClose,
    yourInviteCode,
}: {
    onClose: () => void;
    yourInviteCode: string;
}) {
    const [friendCode, setFriendCode] = useState("");
    const [showSentBubble, setShowSentBubble] = useState(false);

    function handleSubmit(e: any) {
        e.preventDefault();
        if (!friendCode.trim()) return;

        // Show animation bubble
        setShowSentBubble(true);

        setTimeout(() => {
            setShowSentBubble(false);
            setFriendCode("");
        }, 2500);
    }

    function copyCode() {
        navigator.clipboard.writeText(yourInviteCode);
        alert("Invite code copied!");
    }

    async function shareCode() {
        try {
            await navigator.share({
                title: "My Invite Code",
                text: `Join me using this code: ${yourInviteCode}`,
            });
        } catch (err) {
            alert("Sharing not supported on this device");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">

            {/* Popup Card */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gray-900 text-white w-full max-w-md rounded-2xl p-6 relative"
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-3 right-3 p-2 hover:bg-gray-800 rounded-lg">
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold mb-4">Invite Friends</h2>

                {/* ENTER A FRIEND'S CODE */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        value={friendCode}
                        onChange={(e) => setFriendCode(e.target.value)}
                        placeholder="Enter friend's invite code"
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500"
                    />

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg transition"
                    >
                        Send Invite
                        <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
                    </button>
                </form>

                {/* Your Invite Code */}
                <div className="mt-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-300 text-sm mb-2">Your Invite Code</p>

                    <div className="flex items-center justify-between">
                        <span className="font-mono text-lg">{yourInviteCode}</span>

                        <div className="flex gap-3">
                            <button onClick={copyCode} className="p-2 hover:bg-gray-700 rounded-lg">
                                <ClipboardIcon className="w-5 h-5" />
                            </button>
                            <button onClick={shareCode} className="p-2 hover:bg-gray-700 rounded-lg">
                                <ShareIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* SENT MESSAGE BUBBLE ANIMATION */}
                <AnimatePresence>
                    {showSentBubble && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="absolute bottom-[-10px] left-6 bg-blue-600 px-4 py-2 rounded-2xl shadow-lg"
                        >
                            <p className="text-white text-sm">
                                Invite sent!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
