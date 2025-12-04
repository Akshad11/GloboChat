import mongoose from "mongoose";
import { generateInviteCode } from "../utils/generateInviteCode.js";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        avatarUrl: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        inviteCode: {
            type: String,
            trim: true,
            default: null,
        },
        status: {
            type: String,
            enum: ["online", "offline"],
            default: "offline",
        },
        lastSeen: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Unique indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ inviteCode: 1 }, { unique: true });

// Auto-generate fancy invite code only
userSchema.pre("save", async function () {
    if (!this.inviteCode) {
        let newCode;
        let exists = true;

        while (exists) {
            const base = this.username || this.email.split("@")[0];
            newCode = generateInviteCode(base);
            exists = await this.constructor.findOne({ inviteCode: newCode });
        }

        this.inviteCode = newCode;
    }
});

export default mongoose.model("User", userSchema);
