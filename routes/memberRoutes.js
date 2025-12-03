import express from "express";
const router = express.Router();

import {
    addMemberToConversation,
    removeMemberFromConversation
} from "../controllers/memberController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

router.post("/add", authMiddleware, addMemberToConversation);
router.post("/remove", authMiddleware, removeMemberFromConversation);

export default router;
