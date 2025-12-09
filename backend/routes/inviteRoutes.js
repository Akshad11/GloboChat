// routes/inviteRoutes.js

import express from "express";
import {
    sendInvite,
    acceptInviteApi,
    rejectInvite,
    revokeInvite,
    getInviteByCode,
    getMyInvites,
    getAllPendingInvitesForUser,
    getAllPendingSentPrivateInvites,
} from "../controllers/inviteController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/send", authMiddleware, sendInvite);
router.get("/pending", authMiddleware, getAllPendingInvitesForUser);
router.get("/pendingsent", authMiddleware, getAllPendingSentPrivateInvites);
router.post("/accept", authMiddleware, acceptInviteApi);
router.post("/reject", authMiddleware, rejectInvite);
router.post("/revoke", authMiddleware, revokeInvite);
router.get("/:code", authMiddleware, getInviteByCode);
router.get("/", authMiddleware, getMyInvites);

export default router;
