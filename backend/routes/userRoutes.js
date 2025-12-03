import express from "express";
const router = express.Router();

import { getMe, updateMe } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);

export default router;
