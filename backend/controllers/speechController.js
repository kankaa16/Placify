// backend/controllers/speechController.js
import { pipeline } from "@xenova/transformers";
import fs from "fs";

let transcriber = null;

// Load the Whisper model only once
export const initSpeechModel = async () => {
  try {
    console.log("Loading offline Whisper model...");
    transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny.en"
    );
    console.log("Whisper model loaded successfully");
  } catch (err) {
    console.error("Error loading Whisper model:", err);
  }
};

// Transcribe uploaded audio
export const transcribeAudio = async (req, res) => {
  try {
    if (!transcriber) {
      return res
        .status(500)
        .json({ error: "Model not initialized yet. Try again later." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const filePath = req.file.path;
const result = await transcriber(filePath, { chunk_length_s: 30 });    fs.unlinkSync(filePath);

    res.json({ text: result.text });
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: "Transcription failed" });
  }
};
