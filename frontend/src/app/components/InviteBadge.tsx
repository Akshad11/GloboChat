import { useAuth } from "@/context/AuthContext";
import { useSocketEvents } from "@/context/SocketEventsContext";
import { useEffect } from "react";

export default function InviteBadge() {
    const { invites, clearInvites } = useSocketEvents();
    const { loadInvites, invitesReceived } = useAuth();

    useEffect(() => {
        if (invites.length > 0) {
            console.log(invites);
            loadInvites();
            clearInvites();
        }
    }, [invites.length]);


    // ✅ decide count based on priority
    const count =
        invites.length > 0
            ? invites.length
            : invitesReceived.length > 0
                ? invitesReceived.length
                : 0;

    if (count === 0) return null;

    return (
        <span
            className="bg-red-600 text-white text-xs
                       min-w-[18px] h-[18px]
                       flex items-center justify-center
                       rounded-full"
        >
            {count}
        </span>
    );
}
