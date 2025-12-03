import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

function getAccessSecret() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error("JWT_ACCESS_SECRET not set");
    return secret;
}

function getRefreshSecret() {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error("JWT_REFRESH_SECRET not set");
    return secret;
}

const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || "30d";

export function signAccessToken(userId, extra = {}) {
    return jwt.sign(
        { sub: userId, ...extra },
        getAccessSecret(),
        { expiresIn: ACCESS_TTL }
    );
}

export function signRefreshToken(userId) {
    const tokenId = uuidv4();
    const token = jwt.sign(
        { sub: userId, tid: tokenId },
        getRefreshSecret(),
        { expiresIn: REFRESH_TTL }
    );
    const decoded = jwt.decode(token);
    const exp = decoded.exp * 1000;
    return { token, tokenId, expiresAt: new Date(exp) };
}

export function verifyAccessToken(token) {
    return jwt.verify(token, getAccessSecret());
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, getRefreshSecret());
}
