import mongoose from "mongoose";

const { Schema } = mongoose;

const inviteSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
            trim: true,
        },

        // Sender of the invite
        fromUser: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Multiple target users
        toUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                index: true,
            }
        ],

        // "private" or "group"
        invitingTo: {
            type: String,
            enum: ["private", "group"],
            required: true,
        },

        // Conversation or Group ID
        targetId: {
            type: Schema.Types.ObjectId,
            refPath: "targetModel",
            required: true,
        },

        targetModel: {
            type: String,
            enum: ["Conversation", "Group"],
            required: true,
        },

        message: {
            type: String,
            default: "",
            maxlength: 500,
        },

        // Users who accepted
        acceptedBy: [
            {
                user: { type: Schema.Types.ObjectId, ref: "User" },
                at: { type: Date }
            }
        ],

        // Users who rejected
        rejectedBy: [
            {
                user: { type: Schema.Types.ObjectId, ref: "User" },
                at: { type: Date }
            }
        ],

        uses: {
            type: Number,
            default: 0,
        },

        revoked: {
            type: Boolean,
            default: false,
        },

        expiresAt: {
            type: Date,
        },

        meta: {
            ip: String,
            userAgent: String,
            platform: String,
        }
    },
    { timestamps: true }
);


inviteSchema.methods.isValid = function () {
    if (this.revoked) return false;
    if (this.expiresAt && new Date() > this.expiresAt) return false;
    return true;
};

inviteSchema.methods.hasExpired = function () {
    return this.expiresAt && new Date() > this.expiresAt;
};

inviteSchema.methods.incrementUse = async function () {
    this.uses += 1;
    await this.save();
    return this;
};

inviteSchema.methods.revoke = async function () {
    this.revoked = true;
    await this.save();
    return this;
};


inviteSchema.methods.acceptInvite = async function (userId) {
    if (!this.isValid()) return { success: false, reason: "invalid_or_expired" };

    // Remove rejection if they accept
    this.rejectedBy = this.rejectedBy.filter(r => r.user.toString() !== userId.toString());

    const alreadyAccepted = this.acceptedBy.some(a => a.user.toString() === userId.toString());

    if (!alreadyAccepted) {
        this.acceptedBy.push({ user: userId, at: new Date() });
    }

    this.uses += 1;

    await this.save();
    return { success: true, invite: this };
};


inviteSchema.methods.rejectInvite = async function (userId) {
    if (!this.isValid()) return { success: false, reason: "invalid_or_expired" };

    // Remove acceptance if rejecting now
    this.acceptedBy = this.acceptedBy.filter(a => a.user.toString() !== userId.toString());

    const alreadyRejected = this.rejectedBy.some(r => r.user.toString() === userId.toString());

    if (!alreadyRejected) {
        this.rejectedBy.push({ user: userId, at: new Date() });
    }

    await this.save();
    return { success: true, invite: this };
};


inviteSchema.statics.createInvite = async function ({
    code,
    fromUser,
    toUsers,
    invitingTo,
    targetId,
    targetModel,
    message,
    expiresAt,
    meta,
}) {
    return this.create({
        code,
        fromUser,
        toUsers,
        invitingTo,
        targetId,
        targetModel,
        message,
        expiresAt,
        meta,
    });
};

export default mongoose.model("Invite", inviteSchema);
