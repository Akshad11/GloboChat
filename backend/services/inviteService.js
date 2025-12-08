import Invite from "../models/InviteSchema.js";
import User from "../models/User.js";

export async function createInviteData(data) {
    const { fromUserId, inviteId, message, invitingTo } = data;

    /**
     * 1️⃣ Resolve target user from invite code
     */
    const toUser = await User.findOne({ inviteCode: inviteId });

    if (!toUser) {
        throw new Error("Invalid invite code");
    }

    /**
     * 2️⃣ Check bidirectional pending invites
     */
    const existingInvite = await Invite.findOne({
        invitingTo,
        revoked: false,
        $or: [
            { fromUser: fromUserId, toUsers: toUser._id },
            { fromUser: toUser._id, toUsers: fromUserId },
        ],
    });

    if (existingInvite && existingInvite.isValid()) {
        const toStatus = existingInvite.getStatusForUser(toUser._id);

        // 🚩 OTHER USER already invited YOU
        if (existingInvite.fromUser.toString() === toUser._id.toString()) {
            if (toStatus === "pending") {
                return "PendingActionFromYou";
            }
        }

        // ⏳ YOU already invited THEM
        if (existingInvite.fromUser.toString() === fromUserId.toString()) {
            if (toStatus === "pending") {
                return "Pending";
            }
        }
    }

    /**
     * 3️⃣ Create brand new invite
     */
    const invite = await Invite.createInvite({
        code: inviteId,           // invite code used
        fromUser: fromUserId,
        toUsers: [toUser._id],
        invitingTo,
        message,
    });

    return invite._id;
}
