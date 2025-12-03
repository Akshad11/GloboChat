import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["member", "admin"],
            default: "member",
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        isMuted: {
            type: Boolean,
            default: false,
        },
        lastReadMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        unreadCount: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: true }
);

// For fast membership checks
memberSchema.index({ conversationId: 1, userId: 1 }, { unique: true });

// For listing user conversations
memberSchema.index({ userId: 1 });

export default mongoose.model("Member", memberSchema);
