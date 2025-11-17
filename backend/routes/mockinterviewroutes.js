    import express from 'express';
    import verifyToken from "../middlewares/verifyToken.js";
    import User from '../models/usermodel.js';
    import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
import fs from 'fs/promises';
import path from 'path';
import { transcribeAudio } from '../controllers/speechController.js';
    const router = express.Router();
    // --- FIX ---
    // Changed this from 'require' to 'import' to match your ES module syntax
    import { GoogleGenerativeAI } from '@google/generative-ai';

    // --- Debug Checkpoint 1: Check if the API Key is loaded ---
    if (!process.env.GEMINI_API_KEY) {
        console.error("🔴 FATAL ERROR: GEMINI_API_KEY is not found in .env file.");
    } else {
        console.log("✅ GEMINI_API_KEY loaded successfully.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    router.post('/start', verifyToken ,async (req, res) => {
        
        const userId = req.user?.id;
        if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const student = await User.findById(userId);

    if (!student) {
        return res.status(404).json({ error: "User not found" });
    }

        console.log("\n--- New Interview Request Received ---");
        
        try {
            // --- Debug Checkpoint 2: Check the incoming data from the frontend ---
            console.log("Step 1: Receiving data from frontend...");
            const { conversationHistory } = req.body;
            if (!conversationHistory) {
                console.error("🔴 Error: 'conversationHistory' is missing from the request body.");
                return res.status(400).json({ error: "Missing conversationHistory in request." });
            }
            console.log("✅ Frontend Data Received:", JSON.stringify(conversationHistory, null, 2));


             const mockStudent = {
        name: student.fName || "Student",
        resumeScore: student.resumeAnalysis?.score || 50,
        skills: student.skills || []
    };

            // --- Debug Checkpoint 3: Verify the prompt being sent to the AI ---
            console.log("Step 2: Building the prompt for Gemini...");
            const prompt = `
                You are a senior software engineer from a top tech company conducting a technical mock interview.
                The candidate is a Computer Science student named ${mockStudent.name}.
                The student's resume score is ${mockStudent.resumeScore}/100 and their skills include ${mockStudent.skills.join(', ')}.
                Your instructions are:
                1. Ask only ONE question at a time.
                2. If this is the start of the conversation, begin with a friendly greeting and ask "Can you tell me a bit about yourself and your journey into computer science?"
                3. After the user answers, provide brief, constructive feedback (2-3 sentences) and then ask the next logical question.
                4. Maintain a professional and encouraging tone.
                Here is the conversation so far:
                ${conversationHistory.map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`).join('\n')}
            `;
            console.log("✅ Prompt created successfully.");
            // console.log("Prompt being sent to Gemini:\n", prompt); // Optional: Uncomment to see the full prompt

            
        // --- Debug Checkpoint 4: Call the Gemini API ---
    console.log("Step 3: Sending request to Google Gemini API...");

    // 1. Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 2. Generate the content
    const result = await model.generateContent(prompt);

    // 3. Get the response from the result
    const response = await result.response;

    // 4. Get the text from the response
    const text = response.text();

    console.log("✅ Received response from Gemini.");
    // --- End of Fix ---
            // --- Debug Checkpoint 5: Send the response back to the frontend ---
            console.log("Step 4: Sending AI reply back to the frontend.");
            res.status(200).json({ reply: text });
            console.log("--- Request Complete ---");

        } catch (error) {
            console.error("🔴 AN ERROR OCCURRED:", error);
            res.status(500).json({ error: "Failed to communicate with the AI service." });
        }
    });


    
    router.post("/end", verifyToken, async (req, res) => {
  try {
    const { conversationHistory } = req.body;
    if (!conversationHistory) return res.status(400).json({ error: "Missing conversationHistory" });

    const prompt = `
You are an AI interviewer. Evaluate the candidate's responses.

Return the output as STRICT JSON only. 
No extra text, no explanations, no backticks.

Your output must be in this exact format:

{
 "technicalScore": number,
 "communicationScore": number,
 "confidenceScore": number,
 "overallScore": number,
 "feedback": "string"
}

Evaluate based only on these messages:

${conversationHistory.map(m => `${m.role}: ${m.content}`).join("\n")}`



    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    // parse and verify JSON
    let parsed;
    try {
const cleaned = text.replace(/```json|```/g, "").trim();
parsed = JSON.parse(cleaned);

      parsed = JSON.parse(text);
    } catch (parseErr) {
      // fallback strategy: ask model for JSON clean up
      try {
        const fixPrompt = `The previous response failed to parse into JSON. Extract valid JSON only from this text and return JSON only: ${text}`;
        const fixResult = await model.generateContent(fixPrompt);
        const fixedText = (await fixResult.response).text();
        parsed = JSON.parse(fixedText);
      } catch (fixErr) {
        // final fallback: compute simple heuristic scores locally
        const fallback = {
          technicalScore: 60,
          communicationScore: 60,
          confidenceScore: 60,
          overallScore: 60,
          feedback: "AI evaluation failed. A default mid level score was assigned. Try again later."
        };
        return res.json(fallback);
      }
    }

    // ensure numeric bounds and presence of keys
    const clamp = n => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
    const safe = {
      technicalScore: clamp(parsed.technicalScore),
      communicationScore: clamp(parsed.communicationScore),
      confidenceScore: clamp(parsed.confidenceScore),
      overallScore: clamp(parsed.overallScore),
      feedback: String(parsed.feedback || "").slice(0, 400)
    };

    // do not save to database anywhere here
    return res.json(safe);
  } catch (err) {
    console.error("Score generation error:", err);
    // return a safe default so the frontend can still render a card
    return res.status(500).json({
      technicalScore: 60,
      communicationScore: 60,
      confidenceScore: 60,
      overallScore: 60,
      feedback: "Scoring service unavailable. A default score was shown."
    });
  }
});

router.post('/audio', verifyToken, upload.single('audio'), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const student = await User.findById(userId);
    if (!student) return res.status(404).json({ error: 'User not found' });

    // conversationHistory comes as a string form field
    const conversationHistory = req.body.conversationHistory ? JSON.parse(req.body.conversationHistory) : [];
    const role = req.body.role || 'Software Engineer';
    const experience = req.body.experience || 'Internship';

    if (!req.file) return res.status(400).json({ error: 'No audio uploaded' });

    // path to uploaded file
    const audioPath = path.resolve(req.file.path);

    // use your whisper loader to transcribe. this should return plain text
    let transcript = '';
    try {
      transcript = await transcribeAudio(audioPath); // implement this to return string
    } catch (e) {
      console.error('whisper transcribe fail', e);
      // fallback: return a helpful message
      transcript = '';
    } finally {
      // remove uploaded temp file
      try { await fs.unlink(audioPath); } catch (e) { /* ignore */ }
    }

    // append the transcribed user message into conversationHistory for AI context
    // we do not persist the transcript in DB, only in memory for the AI prompt
    const fullHistory = [...conversationHistory, { role: 'user', content: transcript || '[audio answer]' }];

    // build same prompt you used previously
    const mockStudent = {
      name: student.fName || 'Student',
      resumeScore: student.resumeAnalysis?.score || 50,
      skills: student.skills || []
    };

    const prompt = `
      You are a senior software engineer from a top tech company conducting a technical mock interview.
      The candidate is a Computer Science student named ${mockStudent.name}.
      The student's resume score is ${mockStudent.resumeScore}/100 and their skills include ${mockStudent.skills.join(', ')}.
      Your instructions:
      1. Ask only ONE question at a time.
      2. Provide brief constructive feedback after each answer.
      3. Maintain a professional and encouraging tone.
      Here is the conversation so far:
      ${fullHistory.map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`).join('\n')}
    `;

    // call your genAI as before
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const responseText = (await result.response).text();

    // return only reply text. frontend will append conversationHistory itself
    return res.json({ reply: responseText, transcript: undefined }); // do not send transcript

  } catch (err) {
    console.error('audio route error', err);
    return res.status(500).json({ error: 'Failed to process audio' });
  }
});



    export default router;