import express from "express";
import { updateUserReadiness, getUserProfile } from "../controllers/scorecontroller.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = express.Router();

// Update platform handles and fetch new scores
router.put("/readiness/:userId", updateUserReadiness);

// Get user profile and stats
router.get("/:userId",verifyToken, getUserProfile);

export default router;
