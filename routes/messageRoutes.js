import express from "express";
const router = express.Router();

import {
    sendMessage,
    getConversationMessages
} from "../controllers/messageController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

router.post("/", authMiddleware, sendMessage);
router.get("/:id", authMiddleware, getConversationMessages);

export default router;
