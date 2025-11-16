    import express from 'express';
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

    router.post('/start', async (req, res) => {
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
                name: "Suraj",
                resumeScore: 82,
                skills: ["React", "Node.js", "MongoDB"],
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    export default router;