import bcrypt from "bcryptjs";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

export const hashPassword = async (plain) => {
    return await bcrypt.hash(plain, SALT_ROUNDS);
};

export const verifyPassword = async (plain, hash) => {
    return await bcrypt.compare(plain, hash);
};

export const registerUser = async ({ username, email, password }) => {
    const passwordHash = await hashPassword(password);
    const user = await User.create({ username, email, passwordHash });
    return user;
};

export const findUserByEmail = async (email) => {
    return await User.findOne({ email }).lean();
};

export const findUserById = async (id) => {
    return await User.findById(id);
};

export const createTokensForUser = async (user) => {
    const accessToken = signAccessToken(user._id.toString());
    const { token: refreshToken, tokenId, expiresAt } = signRefreshToken(user._id.toString());

    // Persist refresh token record
    await RefreshToken.create({
        userId: user._id,
        tokenId,
        expiresAt,
        revoked: false,
    });

    return { accessToken, refreshToken, tokenId, expiresAt };
};

export const rotateRefreshToken = async (oldTokenStr) => {
    // Verify and ensure token exists and not revoked
    const payload = verifyRefreshToken(oldTokenStr);
    const { tid: tokenId, sub: userId } = payload;

    const tokenRecord = await RefreshToken.findOne({ tokenId });

    if (!tokenRecord || tokenRecord.revoked) {
        const err = new Error("Refresh token invalid or revoked");
        err.status = 401;
        throw err;
    }

    // Revoke old
    tokenRecord.revoked = true;
    await tokenRecord.save();

    // Issue new tokens
    const accessToken = signAccessToken(userId);
    const { token: refreshToken, tokenId: newTokenId, expiresAt } = signRefreshToken(userId);

    await RefreshToken.create({
        userId,
        tokenId: newTokenId,
        expiresAt,
        revoked: false,
    });

    return { accessToken, refreshToken };
};

export const revokeRefreshToken = async (refreshTokenStr) => {
    try {
        const payload = verifyRefreshToken(refreshTokenStr);
        const tokenId = payload.tid;

        const tokenRecord = await RefreshToken.findOne({ tokenId });
        if (!tokenRecord) {
            console.log("Refresh token not found in DB");
            return;
        }
        tokenRecord.revoked = true;
        await tokenRecord.save();

        console.log("Refresh token revoked:", tokenId);
    } catch (err) {
        console.log("Failed to revoke refresh token:", err.message);
    }
};
