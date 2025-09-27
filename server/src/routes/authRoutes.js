
import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

// Signup Request
router.post("/signup", signup);

//Login Request
router.post('/login', login);

export default router; 
