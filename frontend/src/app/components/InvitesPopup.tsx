"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { PendingInvite } from "@/types";
import api from "@/lib/axios";

/* =======================
   ANIMATIONS
======================= */

const popupVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
};

const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0 },
};

const toastVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function InvitesPopup({ onClose }: { onClose: () => void }) {
    const [tab, setTab] = useState<"received" | "sent">("received");
    const [toast, setToast] =
        useState<{ msg: string; type: "success" | "error" } | null>(null);

    const { invitesReceived, invitesSent } = useAuth();

    /* ✅ LOCAL OWNERSHIP (CRITICAL FIX) */
    const [localReceived, setLocalReceived] = useState<PendingInvite[]>([]);
    const [localSent, setLocalSent] = useState<PendingInvite[]>([]);

    /* sync once auth data arrives */
    useEffect(() => {
        if (invitesReceived) setLocalReceived(invitesReceived);
    }, [invitesReceived]);

    useEffect(() => {
        if (invitesSent) setLocalSent(invitesSent);
    }, [invitesSent]);

    const activeInvites =
        tab === "received" ? localReceived : localSent;

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    /* =======================
       API HANDLERS (FIXED)
    ======================= */

    const handleAcceptInvite = async (code: string, id: string) => {
        try {
            await api.post(`/invites/${code}/accept`);
            setLocalReceived(prev => prev.filter(inv => inv._id !== id));
            showToast("Invite accepted");
        } catch {
            showToast("Failed to accept invite", "error");
        }
    };

    const handleRejectInvite = async (code: string, id: string) => {
        try {
            await api.post(`/invites/${code}/reject`);
            setLocalReceived(prev => prev.filter(inv => inv._id !== id));
            showToast("Invite rejected");
        } catch {
            showToast("Failed to reject invite", "error");
        }
    };

    const handleCancelInvite = async (code: string, id: string) => {
        try {
            await api.post(`/invites/${code}/revoke`);
            setLocalSent(prev => prev.filter(inv => inv._id !== id));
            showToast("Request cancelled");
        } catch {
            showToast("Failed to cancel request", "error");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50">
            <AnimatePresence>
                <motion.div
                    variants={popupVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.25 }}
                    className="bg-gray-900 text-white w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl relative"
                >
                    {/* HEADER */}
                    <div className="px-6 pt-6 pb-4">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-semibold">Requests</h2>

                        {/* TABS */}
                        <div className="flex mt-4 bg-gray-800 rounded-xl overflow-hidden">
                            {["received", "sent"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t as any)}
                                    className={`flex-1 py-2 text-sm
                                    ${tab === t ? "bg-blue-600" : "hover:bg-gray-700"}`}
                                >
                                    {t === "received" ? "Received" : "Sent"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* LIST */}
                    <div className="px-4 pb-6 max-h-[320px] overflow-y-auto space-y-3">
                        {activeInvites.length === 0 && (
                            <p className="text-center text-gray-400 text-sm py-10">
                                No {tab} invites
                            </p>
                        )}

                        {activeInvites.map((inv) => {
                            const name =
                                tab === "sent"
                                    ? `${inv.toUsers[0]?.name ?? "User"} ${inv.toUsers[0]?.lastName ?? ""}`
                                    : `${inv.fromUser.name} ${inv.fromUser.lastName}`;

                            return (
                                <motion.div
                                    key={inv._id} // ✅ always unique now
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="flex justify-between items-center bg-gray-800 p-4 rounded-xl"
                                >
                                    <div>
                                        <p className="font-medium">{name}</p>
                                        <p className="text-xs text-gray-400">
                                            Code: {inv.code}
                                        </p>
                                    </div>

                                    {tab === "received" ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAcceptInvite(inv.code, inv._id)}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleRejectInvite(inv.code, inv._id)}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-yellow-400">
                                                Pending
                                            </span>
                                            <button
                                                onClick={() => handleCancelInvite(inv.code, inv._id)}
                                                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* TOAST */}
                {toast && (
                    <motion.div
                        variants={toastVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm
                        ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
