// backend/controllers/speechController.js
import { pipeline } from "@xenova/transformers";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

// --- THIS IS THE FIX ---
// Import 'wavefile' as a default module and then get 'WaveFile' from it
import pkg from 'wavefile';
const { WaveFile } = pkg;
// --- END OF FIX ---

// Tell fluent-ffmpeg where to find the ffmpeg executable
ffmpeg.setFfmpegPath(ffmpegPath.path);

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
  const tempInputPath = req.file.path;
  const tempOutputPath = `${tempInputPath}.wav`; // Output path for the converted file

  try {
    if (!transcriber) {
      console.error("Transcription Error: Model not initialized.");
      return res
        .status(500)
        .json({ error: "Model not initialized yet. Try again later." });
    }

    if (!req.file) {
      console.error("Transcription Error: No file uploaded.");
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    // 1. Convert the .webm file to a 16kHz mono .wav file
    await new Promise((resolve, reject) => {
      console.log("Starting audio conversion...");
      ffmpeg(tempInputPath)
        .audioChannels(1)
        .audioFrequency(16000)
        .toFormat("wav")
        .on("end", () => {
          console.log("Audio conversion finished.");
          resolve();
        })
        .on("error", (err) => {
          console.error("FFMPEG error:", err);
          reject(err);
        })
        .save(tempOutputPath);
    });

    // 2. Read the newly converted .wav file's buffer
    const audioBuffer = fs.readFileSync(tempOutputPath);

    // 3. Decode the .wav buffer into a Float32Array
    const wav = new WaveFile(audioBuffer);
    const audioData = wav.getSamples(true, Float32Array);

    // 4. Give the AI the Float32Array it expects
    const result = await transcriber(audioData, { chunk_length_s: 30 });

    console.log(`Transcription result: "${result.text}"`);

    fs.unlinkSync(tempInputPath); // Clean up the original .webm file
    fs.unlinkSync(tempOutputPath); // Clean up the new .wav file

    res.json({ transcript: result.text }); // Send the transcript back

  } catch (error) {
    console.error("Transcription error:", error);
    // Clean up files on error
    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
    if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    res.status(500).json({ error: "Transcription failed" });
  }
};