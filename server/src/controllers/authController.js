import bcrypt from "bcryptjs";
import prisma from "../db/prisma.js";
import jwt from "jsonwebtoken";

// POST /api/auth/signup
export const signup = async (req, res) => {
	try {
		const { name, username, password } = req.body;

		if (!name || !username || !password) {
			return res.status(400).json({
				success: false,
				message: "name, username, and password are required",
			});
		}

		const duplicate = await prisma.user.findUnique({
			where: { username },
		});

		if (duplicate) {
			return res.status(409).json({
				success: false,
				message: "username already exists",
			});
		}

		const hashedPassword = bcrypt.hashSync(password, 8);

		const user = await prisma.user.create({
			data: { name, username, password: hashedPassword },
			select: { id: true, name: true, username: true },
		});

		return res.status(201).json({ success: true, user });
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

// POST /api/auth/login
export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		// Validate input
		if (!username || !password) {
			return res
				.status(400)
				.json({ success: false, message: "username and password are required" });
		}

		// Fetching User From DB
		const user = await prisma.user.findUnique({
			where: { username },
			select: { id: true, username: true, password: true, name: true },
		});
		if (!user) {
			return res.status(401).json({ success: false, message: "invalid credentials" });
		}

		// Verifying Password
		const ok = await bcrypt.compare(password, user.password);
		if (!ok) {
			return res.status(401).json({ success: false, message: "invalid credentials" });
		}

		// Creating A Token
		const token = jwt.sign(
			{ sub: user.id, username: user.username },
			process.env.JWT_SECRET,
			{ algorithm: "HS256", expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
		);

		// Returning A Token
		return res.status(200).json({
			success: true,
			user: { id: user.id, username: user.username, name: user.name },
			token,
		});
	} catch (err) {
		return res.status(400).json({ success: false, error: err.message });
	}
};

