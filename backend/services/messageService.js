import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const createMessage = async (data) => {
    const message = await Message.create(data);

    // Update conversation last activity
    await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessageAt: new Date(),
    });

    return message;
};

export const getMessages = async (conversationId, limit = 50, before) => {
    const query = { conversationId };

    if (before) {
        query.createdAt = { $lt: before };
    }

    return await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};
