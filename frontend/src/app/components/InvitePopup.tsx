"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    XMarkIcon,
    ClipboardIcon,
    ShareIcon,
    PaperAirplaneIcon,
    CheckIcon,
} from "@heroicons/react/24/outline";

export default function InvitePopup({
    onClose,
    yourInviteCode,
}: {
    onClose: () => void;
    yourInviteCode: string;
}) {
    const [friendCode, setFriendCode] = useState("");
    const [sent, setSent] = useState(false);
    const [copied, setCopied] = useState(false);

    function sendInvite(e: any) {
        e.preventDefault();
        if (!friendCode.trim()) return;

        setSent(true);
        setTimeout(() => {
            setSent(false);
            setFriendCode("");
        }, 2600);
    }

    function copyCode() {
        navigator.clipboard.writeText(yourInviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    async function shareCode() {
        try {
            await navigator.share({
                title: "Invite Code",
                text: `Join me using this invite code: ${yourInviteCode}`,
            });
        } catch { }
    }

    return (
        <AnimatePresence>
            {/* BACKDROP */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-md z-999 flex items-center justify-center"
            >
                {/* POPUP */}
                <motion.div
                    initial={{ scale: 0.75, opacity: 0, y: 40 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        transition: { type: "spring", stiffness: 220, damping: 18 },
                    }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    className="relative w-full max-w-md bg-[#0f1115] text-white rounded-2xl p-6 shadow-2xl border border-gray-800"
                >
                    {/* CLOSE */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-bold mb-2">Invite Friends</h2>
                    <p className="text-sm text-gray-400 mb-5">
                        Enter a friend’s code or share yours.
                    </p>

                    {/* FRIEND CODE INPUT */}
                    <form onSubmit={sendInvite} className="space-y-4">
                        <motion.input
                            whileFocus={{ boxShadow: "0 0 0 2px #3B82F6" }}
                            value={friendCode}
                            onChange={(e) => setFriendCode(e.target.value)}
                            placeholder="Enter invite code"
                            className="w-full p-3 rounded-lg bg-[#1a1d21] border border-gray-700 outline-none"
                        />

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className="
                                w-full py-3 rounded-lg flex items-center justify-center gap-2
                                bg-linear-to-r from-blue-500 to-indigo-500
                                shadow-lg shadow-blue-500/20
                            "
                        >
                            Send Invite
                            <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
                        </motion.button>
                    </form>

                    {/* YOUR INVITE CODE */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mt-6 bg-[#1a1d21] rounded-xl border border-gray-700 p-4"
                    >
                        <p className="text-xs text-gray-400 mb-2">
                            Your invite code
                        </p>

                        <div className="flex items-center justify-between">
                            <span className="font-mono text-lg tracking-widest">
                                {yourInviteCode}
                            </span>

                            <div className="flex items-center gap-2">
                                {/* COPY */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={copyCode}
                                    className="p-2 rounded-lg hover:bg-gray-700 transition"
                                >
                                    {copied ? (
                                        <CheckIcon className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <ClipboardIcon className="w-5 h-5" />
                                    )}
                                </motion.button>

                                {/* SHARE */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={shareCode}
                                    className="p-2 rounded-lg hover:bg-gray-700 transition"
                                >
                                    <ShareIcon className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* SENT BUBBLE */}
                    <AnimatePresence>
                        {sent && (
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                                animate={{ opacity: 1, y: -10, scale: 1 }}
                                exit={{ opacity: 0, y: -40, scale: 0.7 }}
                                className="
                                    absolute left-6 -bottom-8
                                    bg-blue-600 px-4 py-2 rounded-full
                                    shadow-lg shadow-blue-600/40
                                "
                            >
                                <p className="text-sm font-medium">
                                    Invite sent ✅
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
