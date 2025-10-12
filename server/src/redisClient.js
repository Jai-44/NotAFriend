
import { createClient } from "redis";

export const address = new Map();

export const redis = createClient({
	socket: { host: "127.0.0.1", port: 6379 }
});

redis.on("error", (err) => console.error("Redis error:", err));
redis.on("end", () => console.warn("Redis connection closed"));

redis.connect()
	.then(() => console.log("Connected to Redis"))
	.catch((err) => console.error("Redis connection error:", err));

export const addUser = async (user, socket) => {
	await redis.sAdd("activeUsers", user);
	address.set(user, socket);
};

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
};



export const getRandom = async (user) => {
	const TIMEOUT_MS = 10000;
	const INTERVAL_MS = 500;
	const start = Date.now();

	const existing = await redis.hGet("friends", user);
	if (existing) return existing;

	while (Date.now() - start < TIMEOUT_MS) {
		const friend = await redis.sRandMember("activeUsers");
		if (!friend || friend === user) {
			await new Promise(r => setTimeout(r, INTERVAL_MS));
			continue;
		}

		await redis.watch(`friends:${user}`, `friends:${friend}`);
		const [userPaired, friendPaired] = await redis.hmGet("friends", user, friend);

		if (userPaired || friendPaired) {
			await redis.unwatch();
			await new Promise(r => setTimeout(r, INTERVAL_MS));
			continue;
		}

		const tx = redis.multi();
		tx.hSet("friends", user, friend);
		tx.hSet("friends", friend, user);
		tx.sRem("activeUsers", user);
		tx.sRem("activeUsers", friend);

		const result = await tx.exec();
		if (result) {
			return friend;
		}

		await new Promise(r => setTimeout(r, INTERVAL_MS));
	}

	return null;
};


export const addMessage = async (payload, user, type) => {
	const friend = await redis.hGet("friends", user);
	if (!friend) return;

	const field = `${user}:${friend}:${type}`;
	await redis.rPush(field, JSON.stringify(payload));
	await redis.expire(field, 3600); // 1 hour expiry
};

export const getTime = () => new Date().toISOString();

