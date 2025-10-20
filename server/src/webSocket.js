
import { WebSocketServer } from "ws";
import { redis, addUser, removeUser, getRandom, address, addMessage, getTime } from "./redisClient.js";

const webSocketServer = (server) => {
	const ws = new WebSocketServer({ server });

	ws.on("connection", async (socket, request) => {
		try {
			const url = new URL(request.url, `http://${request.headers.host}`);
			const userId = url.searchParams.get("userId");

			if (!userId) {
				socket.close();
				return;
			}

			console.log(`Socket connected: ${userId}`);
			await addUser(userId, socket);

			const friendId = await getRandom(userId);
			if (friendId) {
				const friendSocket = address.get(friendId);
				if (friendSocket) {
					console.log(`Matched ${userId} with ${friendId}`);
					socket.send(JSON.stringify({ type: "matched", with: friendId }));
					friendSocket.send(JSON.stringify({ type: "matched", with: userId }));
				} else {
					console.log(`Friend ${friendId} socket not found, removing pairing`);
					await redis.hDel("friends", userId);
					await redis.hDel("friends", friendId);
					await redis.sAdd("activeUsers", userId);
					await redis.sAdd("activeUsers", friendId);
				}
			} else {
				console.log(`No match found for ${userId} within timeout`);
				socket.send(JSON.stringify({ type: "no_match" }));
			}

			socket.on("message", async (message) => {
				let payload;
				try {
					payload = JSON.parse(message.toString());
				} catch (err) {
					console.error("Invalid JSON:", err);
					return;
				}

				payload.time = getTime();

				const friendId = await redis.hGet("friends", userId);
				const receiverSocket = address.get(friendId);

				if (receiverSocket) {
					receiverSocket.send(JSON.stringify(payload));
				}

				await addMessage(payload, userId, "send");
				await addMessage(payload, friendId, "receive");
			});

			socket.on("close", async () => {
				console.log(`Connection closed: ${userId}`);
				await removeUser(userId);
			});

		} catch (err) {
			console.error("Connection error:", err);
			socket.close();
		}
	});
};

export default webSocketServer;

