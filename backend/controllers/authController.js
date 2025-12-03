import * as authService from "../services/authService.js";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Missing Google ID Token" });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        // --------- Check if user exists ---------
        let user = await User.findOne({ email });

        if (!user) {
            // Create a new Google user
            user = await User.create({
                username: name.toLowerCase().replace(/\s+/g, ""),
                email,
                googleId: sub, // save google account id
                passwordHash: "GOOGLE_USER_NO_PASSWORD", // not used
                avatarUrl: picture,
            });
        }

        // --------- Login existing user or newly created ---------
        const tokens = await authService.createTokensForUser(user);

        return res.json({
            message: user ? "Logged in successfully" : "Account created",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });

    } catch (err) {
        console.error("Google login error:", err);
        return res.status(500).json({ message: "Google login failed" });
    }
};


export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Basic guards (you can enhance later)
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Prevent duplicate email/username
        const existingByEmail = await authService.findUserByEmail(email);
        if (existingByEmail) {
            return res.status(409).json({ message: "Email already in use" });
        }

        // register
        const user = await authService.registerUser({ username, email, password });
        const tokens = await authService.createTokensForUser(user);

        return res.status(201).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl || null,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Registration failed" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

        const user = await authService.findUserByEmail(email);
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const valid = await authService.verifyPassword(password, user.passwordHash);
        if (!valid) return res.status(401).json({ message: "Invalid credentials" });

        const tokens = await authService.createTokensForUser(user);

        return res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl || null,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed" });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: oldRefresh } = req.body;
        if (!oldRefresh) return res.status(400).json({ message: "Missing refresh token" });

        const tokens = await authService.rotateRefreshToken(oldRefresh);

        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    } catch (err) {
        console.error("Refresh token error:", err);
        const status = err.status || 401;
        return res.status(status).json({ message: err.message || "Invalid refresh token" });
    }
};

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await authService.revokeRefreshToken(refreshToken);
        }
        return res.json({ message: "Logged out" });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
    }
};
