"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

/* =======================
   TYPES
======================= */

type ReceivedInvite = {
    id: number;
    type: "received";
    from: string;
    code: string;
};

type SentInvite = {
    id: number;
    type: "sent";
    to: string;
    code: string;
    status: "Pending" | "Accepted" | "Rejected";
};

type Invite = ReceivedInvite | SentInvite;

/* =======================
   COMPONENT
======================= */

export default function InvitesPopup({
    onClose,
}: {
    onClose: () => void;
}) {
    const [tab, setTab] = useState<"received" | "sent">("received");

    // ✅ TEMP MOCK DATA (replace with backend later)
    const receivedInvites: ReceivedInvite[] = [
        {
            id: 1,
            type: "received",
            from: "Akshad",
            code: "AX92KD",
        },
        {
            id: 2,
            type: "received",
            from: "Rahul",
            code: "RHL77K",
        },
    ];

    const sentInvites: SentInvite[] = [
        {
            id: 3,
            type: "sent",
            to: "Ananya",
            code: "AX92KD",
            status: "Pending",
        },
        {
            id: 4,
            type: "sent",
            to: "Vikram",
            code: "AX92KD",
            status: "Accepted",
        },
    ];

    const invites: Invite[] =
        tab === "received" ? receivedInvites : sentInvites;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-999">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-900 text-white w-full max-w-md rounded-2xl p-6 border border-gray-800 relative"
            >
                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                {/* TITLE */}
                <h2 className="text-xl font-semibold mb-4">Requests</h2>

                {/* TABS */}
                <div className="flex mb-4 bg-gray-800 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setTab("received")}
                        className={`flex-1 py-2 text-sm font-medium transition
                            ${tab === "received"
                                ? "bg-blue-600"
                                : "hover:bg-gray-700"
                            }
                        `}
                    >
                        Received
                    </button>
                    <button
                        onClick={() => setTab("sent")}
                        className={`flex-1 py-2 text-sm font-medium transition
                            ${tab === "sent"
                                ? "bg-blue-600"
                                : "hover:bg-gray-700"
                            }
                        `}
                    >
                        Sent
                    </button>
                </div>

                {/* INVITES LIST */}
                <div className="space-y-3 max-h-64 overflow-auto">
                    {invites.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-6">
                            No {tab} invites
                        </p>
                    )}

                    {invites.map((inv) => (
                        <div
                            key={inv.id}
                            className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"
                        >
                            {/* LEFT */}
                            <div>
                                <p className="font-medium">
                                    {inv.type === "received"
                                        ? inv.from
                                        : inv.to}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Code: {inv.code}
                                </p>
                            </div>

                            {/* RIGHT */}
                            {inv.type === "received" ? (
                                <div className="flex gap-2">
                                    <button
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                                        onClick={() =>
                                            console.log("Accept invite", inv.id)
                                        }
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                        onClick={() =>
                                            console.log("Reject invite", inv.id)
                                        }
                                    >
                                        Reject
                                    </button>
                                </div>
                            ) : (
                                <span
                                    className={`text-xs font-medium ${inv.status === "Pending"
                                        ? "text-yellow-400"
                                        : inv.status === "Accepted"
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }`}
                                >
                                    {inv.status}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
