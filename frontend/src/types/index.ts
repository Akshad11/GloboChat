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
