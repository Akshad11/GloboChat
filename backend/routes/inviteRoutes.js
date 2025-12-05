// routes/inviteRoutes.js

import express from "express";
import {
    sendInvite,
    acceptInvite,
    rejectInvite,
    revokeInvite,
    getInviteByCode,
    getMyInvites
} from "../controllers/inviteController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/send", authMiddleware, sendInvite);
router.post("/:code/accept", authMiddleware, acceptInvite);
router.post("/:code/reject", authMiddleware, rejectInvite);
router.post("/:code/revoke", authMiddleware, revokeInvite);
router.get("/:code", authMiddleware, getInviteByCode);
router.get("/", authMiddleware, getMyInvites);

export default router;
