
import { WebSocketServer } from "ws";

// Map of userId -> WebSocket
export const address = new Map();

//Map of userId -> recieverId
export const friends = new Map();

// List of users available to be paired
export let availableConnections = [];

const webSocketServer = (server) => {
	const ws = new WebSocketServer({ server });

	ws.on("connection", (socket, request) => {
		const params = new URLSearchParams(request.url.replace("/?", ""));
		const userId = params.get("userid");

		if (!userId) {
			socket.close();
			return;
		}

		console.log(`Socket connected: ${userId}`);
		address.set(userId, socket);
		availableConnections.push(userId);

		// Try to find a match
		if (availableConnections.length > 1) {
			const remaining = availableConnections.filter(id => id !== userId)
			const reciever = remaining[Math.floor(Math.random() * remaining.length)];
			if (reciever !== userId) {
				friends.set(userId, reciever);
				friends.set(reciever, userId);

				availableConnections = availableConnections.filter(id => id !== userId && id !== reciever);
			}
		}

		socket.on("message", (payload) => {
			const receiverSocket = address.get(friends.get(userId));
			receiverSocket.send(payload);
		});

		socket.on("close", () => {
			console.log(`Connection closed: ${userId}`);
			const reciever = friends.get(userId)
			address.delete(userId);
			availableConnections.push(reciever)
			friends.delete(userId)
			friends.delete(reciever)

			address.get(reciever).send("Connection Removed")
			const index = availableConnections.indexOf(userId);
			if (index !== -1) availableConnections.splice(index, 1);
		});
	});
};

export default webSocketServer;

