
import { createClient } from "redis";

export const redis = createClient({
	socket: { host: "127.0.0.1", port: 6379 }
});

redis.connect()
	.then(() => console.log("Connected to Redis"))
	.catch((err) => console.error("Redis connection error:", err));

export const addUser = async (user) => {
	await redis.sAdd("activeUsers", user);
}

export const removeUser = async (user) => {
	await redis.sRem("activeUsers", user);
}

export const getRandom = async () => {
	const user = await redis.sRandMember("activeUsers");
	return user || null;
}

