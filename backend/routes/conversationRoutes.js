import express from "express";
const router = express.Router();

import {
    createDirect,
    createGroup,
    getMyConversations
} from "../controllers/conversationController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

router.post("/direct", authMiddleware, createDirect);
router.post("/group", authMiddleware, createGroup);
router.get("/", authMiddleware, getMyConversations);

export default router;
