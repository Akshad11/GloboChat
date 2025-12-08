export interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
}

export interface Conversation {
    _id: string;
    name?: string;
    members: User[] | string[];
    isGroup?: boolean;
    lastMessage?: any;
}

export interface Message {
    _id?: string;
    conversationId: string;
    senderId?: string;
    content: string;
    createdAt?: string;
    fromSelf?: boolean;
}

export interface PendingReceivedInvitesResponse {
    count: number;
    invites: PendingInvite[];
}

export interface PendingSentInvitesResponse {
    count: number;
    invites: PendingInvite[];
}

export interface UserSummary {
    _id: string;
    name: string;
    lastName: string;
    avatarUrl?: string;
    inviteCode?: string;
}
export interface InviteAction {
    user: UserSummary;
    at: string;
}


export interface BaseInvite {
    _id: string;
    code: string;

    invitingTo: "private" | "group";

    uses: number;
    revoked: boolean;

    expiresAt?: string | null;

    createdAt: string;
    updatedAt: string;
}

export interface PendingInvite extends BaseInvite {
    fromUser: UserSummary;
    toUsers: UserSummary[];

    acceptedBy: InviteAction[];
    rejectedBy: InviteAction[];
}