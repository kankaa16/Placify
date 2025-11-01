import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SplitPane from 'react-split-pane'; // Ensure this is installed
import './AIInterview.css';
import { Volume2 } from 'lucide-react'; // Example icon library

const AIMockInterviewSession = () => {
    // --- State Variables ---
    const [view, setView] = useState('setup'); // 'setup' or 'interview'
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMicRecording, setIsMicRecording] = useState(false); // Tracks mic recording state
    const [showDoubtChat, setShowDoubtChat] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [transcript, setTranscript] = useState(""); // Holds text from typing OR backend STT
    const [conversationHistory, setConversationHistory] = useState([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false); // Loading state for AI responses
    const [isLoadingSTT, setIsLoadingSTT] = useState(false); // Loading state for Speech-to-Text
    const [error, setError] = useState(null);
    const [role, setRole] = useState("Software Engineer");
    const [experience, setExperience] = useState("Internship");

    // --- Refs ---
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const videoRef = useRef(null);
    const navigate = useNavigate();

    // --- Effect for Camera ---
    useEffect(() => {
        let stream = null;
        if (view === 'interview' && !isCameraOn) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false }) // Don't need audio stream here anymore
                .then(cameraStream => {
                    stream = cameraStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                    setIsCameraOn(true);
                })
                .catch(err => {
                    console.error("Camera error:", err);
                    alert("Could not access your camera. Check permissions.");
                    setView('setup'); // Go back to setup if camera fails
                });
        }
        // Cleanup: Stop camera when leaving interview view or component unmounts
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setIsCameraOn(false); // Ensure camera state is reset
        };
    }, [view]); // Run when view changes


    // --- Start Interview Flow ---
    const handleStartInterviewFlow = async () => {
        setView('interview'); // Trigger camera useEffect
        setIsLoadingAI(true);
        setError(null);
        const initialHistory = [];
        try {
            // Fetch initial question from backend
            const response = await fetch('/api/mock-interview/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationHistory: initialHistory, role, experience }),
            });
            if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
            const data = await response.json();
            setCurrentQuestion(data.reply);
            setConversationHistory([{ role: 'model', content: data.reply }]);
        } catch (err) {
            console.error("Failed to start interview:", err);
            setError("Could not start the interview. Please check connection.");
            setCurrentQuestion("Error: Could not start interview.");
            setView('setup'); // Revert to setup on error
        } finally {
            setIsLoadingAI(false);
        }
    };

    // --- Mic Recording and Transcription ---
    const handleToggleMic = async () => {
        if (isMicRecording) {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop(); // This triggers 'onstop'
                setIsMicRecording(false);
                setIsLoadingSTT(true); // Indicate that transcription is happening
            }
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // --- Choose a mimeType supported by browser and potentially your backend ---
                // Common options: 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/wav'
                const options = { mimeType: 'audio/webm;codecs=opus' };
                 if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                     console.warn(`${options.mimeType} not supported, trying default`);
                     delete options.mimeType; // Fallback to browser default
                 }

                mediaRecorderRef.current = new MediaRecorder(stream, options);
                audioChunksRef.current = []; // Clear previous chunks

                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType || 'audio/webm' });

                    // --- Send audioBlob to backend for transcription ---
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'interview_audio.webm'); // Adjust filename/type if needed

                    try {
                        // ** YOU NEED TO BUILD THIS BACKEND ENDPOINT **
                        const response = await fetch('/api/speech/transcribe', {
                            method: 'POST',
                            body: formData, // Send as form data
                        });

                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({})); // Try to get error details
                            throw new Error(`Transcription API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
                        }

                        const data = await response.json();
                        if (data.transcript) {
                            // Append transcribed text to the textarea content
                            setTranscript(prev => (prev + " " + data.transcript).trim());
                        } else {
                            throw new Error("Backend did not return a transcript.");
                        }

                    } catch (err) {
                        console.error("Transcription failed:", err);
                        setError("Speech-to-text failed. Please try again.");
                    } finally {
                        setIsLoadingSTT(false); // Transcription finished (or failed)
                    }

                    // Clean up mic stream
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current.start();
                setIsMicRecording(true);

            } catch (err) {
                console.error("Mic access error:", err);
                alert("Could not access your microphone. Check permissions or ensure it's not in use.");
                setIsMicRecording(false); // Ensure state is correct on error
            }
        }
    };


    // --- Submit Answer to AI ---
    const handleSubmitAnswer = async () => {
        if (!transcript.trim()) {
            alert("Answer cannot be empty.");
            return;
        }
        setIsLoadingAI(true); setError(null);
        const userMessage = { role: 'user', content: transcript };
        const newHistory = [...conversationHistory, userMessage];
        setConversationHistory(newHistory);
        try {
            // Send conversation history + context to backend for AI response
            const response = await fetch('/api/mock-interview/start', { // Reusing start endpoint for conversation turn
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationHistory: newHistory, role, experience }),
            });
            if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
            const data = await response.json();
            setCurrentQuestion(data.reply);
            setConversationHistory(prev => [...prev, { role: 'model', content: data.reply }]);
            setTranscript(""); // Clear textarea for next answer
        } catch (err) {
            console.error("Failed to submit answer:", err);
            setError("Failed to get AI response. Please try submitting again.");
            setConversationHistory(prev => prev.slice(0, -1)); // Revert history
        } finally {
            setIsLoadingAI(false);
        }
    };

    // --- Utility Functions ---
    const handleResetTranscript = () => setTranscript("");
    const handleSpeakQuestion = () => {
        if (currentQuestion && typeof SpeechSynthesisUtterance !== 'undefined') {
            try {
                // Cancel any ongoing speech first
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(currentQuestion);
                utterance.onerror = (event) => console.error("SpeechSynthesis error:", event.error);
                window.speechSynthesis.speak(utterance);
            } catch (err) {
                console.error("Error speaking question:", err);
            }
        } else {
            console.warn("Speech synthesis not available or no question.");
        }
     };
    const handleBack = () => {
        // Stop recording if active before going back
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setIsMicRecording(false);
        setView('setup'); // Go back to setup screen
        // Reset state for a fresh start next time
        setCurrentQuestion("");
        setConversationHistory([]);
        setTranscript("");
        setError(null);
    };

    // --- Render Logic ---
    if (view === 'setup') {
        return (
            <div className="interview-container setup-page">
                <div className="setup-content">
                    <h1 className="setup-title">Prepare for your AI Mock Interview</h1>
                    <p className="setup-subtitle">Select the role and experience level you want to practice for.</p>
                    <div className="interview-setup-options large-setup">
                         <label>
                            Select Role:
                            <select value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="Software Engineer">Software Engineer</option>
                                <option value="Frontend Developer">Frontend Developer</option>
                                <option value="Backend Developer">Backend Developer</option>
                                <option value="Full Stack Developer">Full Stack Developer</option>
                                <option value="Data Scientist">Data Scientist</option>
                            </select>
                        </label>
                        <label>
                            Select Experience:
                            <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                                <option value="Internship">Internship</option>
                                <option value="Junior (0-2 years)">Junior (0-2 years)</option>
                                <option value="Mid-level (2-5 years)">Mid-level (2-5 years)</option>
                                <option value="Senior (5+ years)">Senior (5+ years)</option>
                            </select>
                        </label>
                    </div>
                     <button
                        className="control-btn start-interview-btn large-start-btn"
                        onClick={handleStartInterviewFlow}
                        disabled={isLoadingAI} // Disable while fetching first question
                     >
                        {isLoadingAI ? "Starting..." : "Begin Interview"}
                    </button>
                    {error && <p className="error-feedback setup-error">{error}</p>}
                </div>
            </div>
        );
    }

    // --- Interview View ---
    return (
        <div className="interview-container session-page">
            <div className="top-bar">
                <button className="back-btn" onClick={handleBack} disabled={isLoadingAI || isLoadingSTT}>← End Session</button>
                <p className="interview-title">AI Mock Interview</p>
                {/* Placeholder for potential future top-bar items */}
            </div>

            {/* Main resizable split */}
            <SplitPane split="vertical" defaultSize="50%" minSize={300} maxSize={-300} className="main-split-pane">
                 {/* --- USER PANEL with Nested SplitPane --- */}
                <div className="video-panel user-panel">
                    <SplitPane split="horizontal" defaultSize="60%" minSize={150} maxSize={-150} >
                        {/* Top Pane: Video Feed */}
                        <div className="pane-content video-pane">
                            <div className="video-feed-container">
                                {isCameraOn ? (
                                    <video ref={videoRef} className="video-feed" autoPlay muted></video>
                                ) : (
                                    <div className="video-placeholder">Camera starting...</div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Pane: Transcript Box */}
                        <div className="pane-content transcript-pane">
                            <div className="transcript-box">
                                <p><strong>Your Answer:</strong></p>
                                <textarea
                                    className="transcript-textarea"
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    placeholder="Type or click 'Start Mic' to speak..."
                                    // Disable textarea while AI is responding or STT is processing
                                    disabled={isLoadingAI || isLoadingSTT || isMicRecording}
                                />
                                {/* Display STT status clearly */}
                                <p className={`ai-feedback model-status ${isLoadingSTT ? 'loading' : ''} ${isMicRecording ? 'listening': ''}`}>
                                     {isMicRecording ? 'Listening...' : (isLoadingSTT ? 'Transcribing...' : '')}
                                </p>
                                {isLoadingAI && <p className="ai-feedback">Waiting for AI feedback...</p>}
                                {error && <p className="ai-feedback error-feedback">{error}</p>}
                            </div>
                        </div>
                    </SplitPane>
                </div>

                {/* --- AI PANEL with Nested SplitPane --- */}
                <div className="video-panel ai-panel">
                     {/* FIX: Changed defaultSize from 100% to 40% to make both panes visible */}
                     <SplitPane split="horizontal" defaultSize="40%" minSize={100} maxSize={-100}>
                        {/* Top Pane: AI Avatar */}
                         <div className="pane-content avatar-pane">
                            <div className="ai-avatar-container">
                                <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="AI Avatar" className="ai-avatar" />
                                <p className="ai-name">Placify AI Interviewer</p>
                            </div>
                        </div>

                        {/* Bottom Pane: Question Box */}
                        <div className="pane-content question-pane">
                            <div className="question-display-box">
                                {currentQuestion ? (
                                    <>
                                        <p className="question-text">{currentQuestion}</p>
                                        <button className="speak-question-btn" onClick={handleSpeakQuestion} title="Listen to question">
                                            <Volume2 size={20} /> {/* Speaker Icon */}
                                        </button>
                                    </>
                                ) : (
                                     <p className="question-text">Waiting for question...</p>
                                )}

                            </div>
                        </div>
                    </SplitPane>
                </div>
            </SplitPane> {/* End of main vertical split */}


            {/* --- Controls Bar --- */}
            <div className="controls-bar">
                 <button
                    className={`control-btn ${isMicRecording ? 'active' : ''}`}
                    onClick={handleToggleMic}
                    // Disable if loading AI/STT, camera off, or during transcription
                    disabled={isLoadingAI || isLoadingSTT || !isCameraOn}
                 >
                    {isMicRecording ? "Stop Mic" : "Start Mic"}
                 </button>
                <button className="control-btn" onClick={handleSpeakQuestion} disabled={isLoadingAI || isLoadingSTT || !isCameraOn || !currentQuestion}>Listen</button>
                <button className="control-btn" onClick={() => setShowDoubtChat(!showDoubtChat)} disabled={isLoadingAI || isLoadingSTT || !isCameraOn}>Ask Doubt</button>
                <button className="control-btn" onClick={handleResetTranscript} disabled={isLoadingAI || isLoadingSTT || !isCameraOn}>Reset</button>
                <button className="control-btn submit-btn" onClick={handleSubmitAnswer} disabled={isLoadingAI || isLoadingSTT || !isCameraOn || !transcript.trim()}>
                    {isLoadingAI ? "Submitting..." : "Submit Answer"}
                </button>
            </div>

             {/* --- Doubt Chat Window --- */}
             {showDoubtChat && (
                 <div className="doubt-chat-window">
                     <div className="chat-header">
                         <p>Ask for Clarification</p>
                         <button onClick={() => setShowDoubtChat(false)}>&times;</button>
                     </div>
                     {/* Basic chat structure - needs implementation */}
                     <div className="chat-messages"> <p className="ai-chat-msg">AI: How can I help?</p> </div>
                     <div className="chat-input"> <input type="text" placeholder="Type..." /> <button>Send</button> </div>
                 </div>
             )}
        </div>
    );
};

export default AIMockInterviewSession;

