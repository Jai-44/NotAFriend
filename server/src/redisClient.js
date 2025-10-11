
import { createClient } from "redis";

export const address = new Map();

export const redis = createClient({
	socket: { host: "127.0.0.1", port: 6379 }
});

redis.connect()
	.then(() => console.log("Connected to Redis"))
	.catch((err) => console.error("Redis connection error:", err));

export const addUser = async (user, socket) => {
	await redis.sAdd("activeUsers", user);
	address.set(user, socket);
}

export const removeUser = async (user) => {
	const friend = await redis.hGet("friends", user);

	await redis.sRem("activeUsers", user);
	await redis.hDel("friends", user);
	address.delete(user);

	if (friend) {
		await redis.hDel("friends", friend);
		await redis.sAdd("activeUsers", friend);
		const friendSocket = address.get(friend);
		if (friendSocket) {
			friendSocket.send(JSON.stringify({ type: "disconnected" }));
		}
	}
}

export const getRandom = async (user) => {
	const existing = await redis.hGet("friends", user);
	if (existing) return existing;

	const users = await redis.sMembers("activeUsers");
	if (users.length < 2) return null;

	// Pick random friend excluding self
	const availableUsers = users.filter(u => u !== user);
	const friend = availableUsers[Math.floor(Math.random() * availableUsers.length)];

	// Save friendship
	await redis.hSet("friends", user, friend);
	await redis.hSet("friends", friend, user);

	await redis.sRem("activeUsers", user);
	await redis.sRem("activeUsers", friend);

	return friend;
}

