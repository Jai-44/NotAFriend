
import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import webSocketServer from "./webSocket.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Create a single HTTP server
const server = http.createServer(app);

// Attach WebSocket server to the same HTTP server
webSocketServer(server);

// Start listening
server.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});

