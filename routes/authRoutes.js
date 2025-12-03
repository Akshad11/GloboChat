import express from "express";
const router = express.Router();

// Auth controllers (will be added in Phase 3)
import { register, login, refreshToken, logout } from "../controllers/authController.js";

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
