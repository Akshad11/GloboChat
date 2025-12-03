import { createClient } from "redis";

let redis;

export function createRedisClient() {
    const client = createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
        password: process.env.REDIS_PASSWORD || undefined,
        database: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
    });

    client.on("connect", () => console.log("🔌 Redis connected"));
    client.on("error", (err) => console.error("❌ Redis error:", err));
    client.on("reconnecting", () => console.log("🔄 Redis reconnecting..."));

    return client;
}

export async function initRedis() {
    redis = createRedisClient();
    await redis.connect();
    return redis;
}

export function getRedis() {
    if (!redis) throw new Error("Redis not initialized!");
    return redis;
}
