import express from "express";
const router = express.Router();

import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import conversationRoutes from "./conversationRoutes.js";
import memberRoutes from "./memberRoutes.js";
import messageRoutes from "./messageRoutes.js";

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/members", memberRoutes);
router.use("/messages", messageRoutes);

export default router;
