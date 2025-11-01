// backend/routes/speechroute.js
import express from "express";
import multer from "multer";
import { transcribeAudio } from "../controllers/speechController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // saves temp audio files

router.post("/transcribe", upload.single("audio"), transcribeAudio);

export default router;
