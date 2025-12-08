import { useSocketEvents } from "@/context/SocketEventsContext";

export default function InviteBadge() {
    const { invites } = useSocketEvents();

    if (!invites || invites.length === 0) return null;

    return (
        <span className="bg-red-600 text-white text-xs 
                         min-w-[18px] h-[18px] 
                         flex items-center justify-center 
                         rounded-full">
            {invites.length}
        </span>
    );
}
