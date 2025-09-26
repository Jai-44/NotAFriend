import express from "express"

// Routes
import userRoutes from "./routes/userRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"


const app = express()

// Middleware to parse JSON request bodies
app.use(express.json())

// Connect user routes → any request starting with /api/users
app.use("/api/users", userRoutes)
app.use("api/auth", authRoutes)
app.use("api/messages", chatRoutes)


// Fallback route
app.get("/", (req, res) => {
	res.send("✅ Server is running!")
})

export default app
