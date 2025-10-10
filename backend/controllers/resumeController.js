// import dotenv from "dotenv";
// dotenv.config();

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const pdfParse = require("pdf-parse"); // require works with CommonJS

// import { Client } from "@gradio/client";

// const resumeClient = await Client.connect("girishwangikar/ResumeATS");

// export const analyzeResumeATS = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "PDF file is required" });

//     const pdfData = await pdfParse(req.file.buffer); // now pdfParse is a function
//     const resumeText = pdfData.text.trim();
//     const jobDescription = req.body.job_description || "";

//     const result = await resumeClient.predict("/analyze_resume", {
//       resume_text: resumeText,
//       job_description: jobDescription,
//       with_job_description: true,
//       temperature: 0.5,
//       max_tokens: 1024,
//     });

//     res.json({ analysis: result.data[0] });

//   } catch (err) {
//     console.error("Resume ATS analysis error:", err);
//     res.status(500).json({ error: "Failed to analyze resume" });
//   }
// };

import dotenv from "dotenv";
dotenv.config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { Client } from "@gradio/client";
import User from "../models/usermodel.js";

const resumeClient = await Client.connect("girishwangikar/ResumeATS");

export const analyzeResumeATS = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF file is required" });

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text.trim();
    const jobDescription = req.body.job_description || "";

    const result = await resumeClient.predict("/analyze_resume", {
      resume_text: resumeText,
      job_description: jobDescription,
      with_job_description: true,
      temperature: 0.5,
      max_tokens: 1024
    });

    const analysisText = result.data[0];
    const match = analysisText.match(/Match Percentage[:\s]*([0-9]{1,3})\s*%/i);
    const score = match ? parseInt(match[1]) : 0;

    // extract missing/matched skills
    const missingSkills = analysisText
      .match(/\*\*Missing Keywords:\*\*([\s\S]*?)(?=\*\*|$)/i)?.[1]
      ?.split("\n")
      .map(s => s.trim())
      .filter(Boolean) || [];

    const matchedSkills = analysisText
      .match(/\*\*Matched Keywords:\*\*([\s\S]*?)(?=\*\*|$)/i)?.[1]
      ?.split("\n")
      .map(s => s.trim())
      .filter(Boolean) || [];

    // update user’s resume analysis in MongoDB
    const userId = req.user?.id;
    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            "resumeAnalysis.role": jobDescription || "Not specified",
            "resumeAnalysis.score": score,
            "resumeAnalysis.matchedSkills": matchedSkills,
            "resumeAnalysis.missingSkills": missingSkills,
            "resumeAnalysis.parsedData": analysisText
          }
        },
        { new: true }
      );
    }

    res.json({ analysis: analysisText, score });

  } catch (err) {
    console.error("Resume ATS analysis error:", err);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
};

