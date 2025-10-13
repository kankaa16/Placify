import express from "express";
import multer from "multer";
import verifyToken from '../middlewares/verifyToken.js'
import { analyzeResumeATS } from "../controllers/resumeController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", verifyToken, upload.single("file"), analyzeResumeATS);

export default router;
