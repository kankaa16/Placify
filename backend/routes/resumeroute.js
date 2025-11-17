import express from "express";
import multer from "multer";
import verifyToken from '../middlewares/verifyToken.js'
import { analyzeResumeATS } from "../controllers/resumeController.js";
import User from '../models/usermodel.js'
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", verifyToken, upload.single("file"), analyzeResumeATS);

router.post("/save", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { role, score, matchedSkills, missingSkills, parsedData } = req.body;

    

    await User.findByIdAndUpdate(userId, {
      resumeAnalysis: {
        role,
        score,
        matchedSkills,
        missingSkills,
        parsedData
      }
    });

    res.json({ message: "Resume analysis saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save resume analysis" });
  }
});


export default router;
