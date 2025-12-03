import Conversation from "../models/Conversation.js";
import Member from "../models/Member.js";

export const createDirectConversation = async (user1, user2) => {
    // Check if already exists
    const existing = await Member.find({
        userId: { $in: [user1, user2] }
    }).lean();

    // In production: add a better "direct convo exists" detector

    const conversation = await Conversation.create({
        type: "direct",
        createdBy: user1,
    });

    await Member.create([
        { conversationId: conversation._id, userId: user1 },
        { conversationId: conversation._id, userId: user2 }
    ]);

    return conversation;
};

export const createGroupConversation = async (creatorId, name, members) => {
    const conversation = await Conversation.create({
        type: "group",
        name,
        createdBy: creatorId,
    });

    const memberDocs = members.map((userId) => ({
        conversationId: conversation._id,
        userId,
        role: "member"
    }));

    await Member.create(memberDocs);

    return conversation;
};

export const getUserConversations = async (userId) => {
    return await Member.find({ userId })
        .populate("conversationId")
        .lean();
};
