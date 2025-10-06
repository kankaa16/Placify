import express from "express";
import { updateUserReadiness, getUserProfile } from "../controllers/scorecontroller.js";

const router = express.Router();

router.put("/readiness/:userId", updateUserReadiness);
router.get("/:userId", getUserProfile);

export default router;
