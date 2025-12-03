import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
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
        status: {
            type: String,
            enum: ["online", "offline"],
            default: "offline",
        },
        lastSeen: Date,
    },
    { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
