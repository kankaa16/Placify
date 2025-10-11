import express from "express";
import { updateUserReadiness, getUserProfile, saveUserHandles } from "../controllers/scorecontroller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/save-handles/:userId", verifyToken, saveUserHandles);
router.get("/:userId", verifyToken, getUserProfile);
router.put("/readiness/:userId", updateUserReadiness);

export default router;
