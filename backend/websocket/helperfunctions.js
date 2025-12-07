
import User from "../models/User.js";
import fs from "fs";
import path from "path";

export async function getDBUserByID(userId) {
    return await User.findById(userId).select("_id username email name lastName inviteCode");
}

export function PrintOnlineUsers(context, onlineUsers) {
    const filePath = path.join(process.cwd(), "data", "onlineUsers.json");
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const snapshot = {
        context,
        timestamp: new Date().toISOString(),
        totalUsers: onlineUsers.size,
        users: [],
    };

    for (const [userId, entry] of onlineUsers.entries()) {
        const socketsSet =
            entry instanceof Set
                ? entry
                : entry?.sockets instanceof Set
                    ? entry.sockets
                    : new Set();

        snapshot.users.push({
            userId,
            socketCount: socketsSet.size,
            sockets: [...socketsSet],
            user: entry?.user
                ? {
                    id: entry.user.id,
                    username: entry.user.username,
                    email: entry.user.email,
                    name: entry.user.name,
                    firstname: entry.user.name,
                    lastname: entry.user.lastname,
                    inviteCode: entry.user.inviteCode,
                }
                : null,
        });
    }

    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf-8");

    console.log(`\n📡 Online Users Snapshot (${context})`);
    console.log(`✅ Total online users: ${snapshot.totalUsers}`);
}