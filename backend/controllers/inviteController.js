// controllers/inviteController.js

import Invite from "../models/InviteSchema.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| SEND INVITE
|--------------------------------------------------------------------------
| fromUser = req.user._id
| toUsers = list of user IDs
| invitingTo = "private" | "group"
| targetId = conversation or group ID
| targetModel = "Conversation" | "Group"
| message (optional)
*/
export const sendInvite = async (req, res) => {
    try {
        const fromUser = req.user._id;
        const { toUsers, invitingTo, targetId, targetModel, message, expiresAt } = req.body;

        if (!toUsers || !Array.isArray(toUsers) || toUsers.length === 0) {
            return res.status(400).json({ message: "toUsers array required" });
        }

        if (!invitingTo || !["private", "group"].includes(invitingTo)) {
            return res.status(400).json({ message: "Invalid invitingTo type" });
        }

        if (!targetId || !targetModel) {
            return res.status(400).json({ message: "Target conversation or group required" });
        }

        // sender's invite code from their User record
        const user = await User.findById(fromUser);
        if (!user) return res.status(404).json({ message: "Sender not found" });

        const invite = await Invite.createInvite({
            code: user.inviteCode,
            fromUser,
            toUsers,
            invitingTo,
            targetId,
            targetModel,
            message,
            expiresAt,
            meta: {
                ip: req.ip,
                userAgent: req.headers["user-agent"],
                platform: req.headers["sec-ch-ua-platform"]
            }
        });

        return res.status(201).json({
            message: "Invite sent successfully",
            invite
        });

    } catch (err) {
        console.error("Send invite error:", err);
        return res.status(500).json({ message: "Failed to send invite" });
    }
};


/*
|--------------------------------------------------------------------------
| ACCEPT INVITE
|--------------------------------------------------------------------------
*/
export const acceptInvite = async (req, res) => {
    try {
        const { code } = req.params;
        const userId = req.user._id;

        const invite = await Invite.findOne({ code });
        if (!invite) return res.status(404).json({ message: "Invite not found" });

        const { success, reason } = await invite.acceptInvite(userId);

        if (!success) {
            return res.status(400).json({ message: `Cannot accept invite: ${reason}` });
        }

        return res.status(200).json({
            message: "Invite accepted",
            invite
        });

    } catch (err) {
        console.error("Accept invite error:", err);
        return res.status(500).json({ message: "Failed to accept invite" });
    }
};


/*
|--------------------------------------------------------------------------
| REJECT INVITE
|--------------------------------------------------------------------------
*/
export const rejectInvite = async (req, res) => {
    try {
        const { code } = req.params;
        const userId = req.user._id;

        const invite = await Invite.findOne({ code });
        if (!invite) return res.status(404).json({ message: "Invite not found" });

        const { success, reason } = await invite.rejectInvite(userId);

        if (!success) {
            return res.status(400).json({ message: `Cannot reject invite: ${reason}` });
        }

        return res.status(200).json({
            message: "Invite rejected",
            invite
        });

    } catch (err) {
        console.error("Reject invite error:", err);
        return res.status(500).json({ message: "Failed to reject invite" });
    }
};


/*
|--------------------------------------------------------------------------
| REVOKE INVITE (sender only)
|--------------------------------------------------------------------------
*/
export const revokeInvite = async (req, res) => {
    try {
        const { code } = req.params;
        const userId = req.user._id;

        const invite = await Invite.findOne({ code });
        if (!invite) return res.status(404).json({ message: "Invite not found" });

        if (invite.fromUser.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only revoke invites you created" });
        }

        await invite.revoke();

        return res.status(200).json({
            message: "Invite revoked",
            invite
        });

    } catch (err) {
        console.error("Revoke invite error:", err);
        return res.status(500).json({ message: "Failed to revoke invite" });
    }
};


/*
|--------------------------------------------------------------------------
| GET INVITE BY CODE
|--------------------------------------------------------------------------
*/
export const getInviteByCode = async (req, res) => {
    try {
        const invite = await Invite.findOne({ code: req.params.code })
            .populate("fromUser", "username avatarUrl")
            .populate("toUsers", "username avatarUrl")
            .populate("acceptedBy.user", "username avatarUrl")
            .populate("rejectedBy.user", "username avatarUrl");

        if (!invite) return res.status(404).json({ message: "Invite not found" });

        return res.status(200).json({ invite });

    } catch (err) {
        console.error("Get invite error:", err);
        return res.status(500).json({ message: "Failed to fetch invite" });
    }
};


/*
|--------------------------------------------------------------------------
| GET ALL INVITES SENT TO CURRENT USER
|--------------------------------------------------------------------------
*/
export const getMyInvites = async (req, res) => {
    try {
        const userId = req.user._id;

        const invites = await Invite.find({ toUsers: userId })
            .populate("fromUser", "username avatarUrl")
            .sort({ createdAt: -1 });

        return res.status(200).json({ invites });

    } catch (err) {
        console.error("Get my invites error:", err);
        return res.status(500).json({ message: "Failed to fetch invites" });
    }
};
