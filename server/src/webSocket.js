
import { WebSocketServer } from "ws";
import { redis, addUser, removeUser, getRandom, address } from "./redisClient";

const webSocketServer = (server) => {
	const ws = new WebSocketServer({ server });

	ws.on("connection", async (socket, request) => {
		const params = new URLSearchParams(request.url.replace("/?", ""));
		const userId = params.get("userid");

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
				socket.send(JSON.stringify({ type: "matched", with: friendId }));
				friendSocket.send(JSON.stringify({ type: "matched", with: userId }));
			}
		}

		socket.on("message", async (payload) => {
			const friendId = await redis.hGet("friends", userId);
			const receiverSocket = address.get(friendId);
			if (receiverSocket) receiverSocket.send(payload);
		});

		socket.on("close", async () => {
			console.log(`Connection closed: ${userId}`);
			await removeUser(userId);
		});
	});
};

export default webSocketServer;

