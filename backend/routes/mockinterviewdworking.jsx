import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SplitPane from 'react-split-pane'; // Ensure this is installed
import './AIInterview.css';
import { Volume2 } from 'lucide-react'; // Example icon library

// --- 1. SETUP BROWSER SPEECH RECOGNITION ---
// Check if the browser supports it (Chrome, Edge, etc.)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const AIMockInterviewSession = () => {
    // --- State Variables ---
    const [view, setView] = useState('setup'); // 'setup' or 'interview'
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMicRecording, setIsMicRecording] = useState(false); // Tracks mic recording state
    const [showDoubtChat, setShowDoubtChat] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [transcript, setTranscript] = useState(""); // Holds text from typing OR speech
    const [conversationHistory, setConversationHistory] = useState([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false); // Loading state for AI responses
    
    // This state is for the offline model. We comment out its usage but keep the state.
    const [isLoadingSTT, setIsLoadingSTT] = useState(false); // Loading state for Speech-to-Text
    
    const [error, setError] = useState(null);
    const [role, setRole] = useState("Software Engineer");
    const [experience, setExperience] = useState("Internship");

    // --- Refs ---
    const mediaRecorderRef = useRef(null); // For offline model
    const audioChunksRef = useRef([]); // For offline model
    const videoRef = useRef(null);
    const navigate = useNavigate();

    // --- 2. REF TO HOLD THE BROWSER RECOGNITION INSTANCE ---
    const recognitionRef = useRef(null);

    // --- Effect for Camera ---
    // (This code is from your file, it's correct)
    useEffect(() => {
        let stream = null;
        if (view === 'interview' && !isCameraOn) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
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
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setIsCameraOn(false);
        };
    }, [view]);

    // --- 3. NEW EFFECT TO SETUP BROWSER SPEECH API ---
    useEffect(() => {
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true; // Keep listening
            recognitionRef.current.interimResults = true; // Show partial results
            recognitionRef.current.lang = 'en-US';

            // This event fires when the API gets a result
            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                // Loop through all results
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    // Append the final recognized text to our transcript
                    setTranscript(prev => (prev + " " + finalTranscript).trim());
                }
            };

            // This event fires when listening stops
            recognitionRef.current.onend = () => {
                if (isMicRecording) {
                    // If it was stopped manually, update state
                    setIsMicRecording(false);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("SpeechRecognition error:", event.error);
                setError("Speech recognition error: " + event.error);
                setIsMicRecording(false);
            };
        } else {
            console.warn("Speech Recognition not supported in this browser.");
            setError("Speech Recognition not supported in this browser.");
        }
    }, []); // Runs only once when the component mounts


    // --- Start Interview Flow ---
    // (This code is from your file, it's correct)
    const handleStartInterviewFlow = async () => {
        setView('interview'); 
        setIsLoadingAI(true);
        setError(null);
        const initialHistory = [];
        try {
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
            setView('setup'); 
        } finally {
            setIsLoadingAI(false);
        }
    };

    // --- 4. MODIFIED Mic Recording Function ---
    const handleToggleMic = async () => {
        
        // --- NEW BROWSER SPEECH-TO-TEXT LOGIC ---
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported on your browser.");
            return;
        }

        if (isMicRecording) {
            // Stop recording
            recognitionRef.current.stop();
            setIsMicRecording(false);
        } else {
            // Start recording
            recognitionRef.current.start();
            setIsMicRecording(true);
        }

        // ---
        // --- OFFLINE (XENOVA) MODEL LOGIC - Commented out for future use ---
        // --- To use this, comment out the section above and uncomment this one ---
        /*
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

                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'interview_audio.webm'); 

                    try {
                        const response = await fetch('/api/speech/transcribe', {
                            method: 'POST',
                            body: formData, 
                        });

                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({})); 
                            throw new Error(`Transcription API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
                        }

                        const data = await response.json();
                        if (data.transcript) {
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
                setIsMicRecording(false); 
            }
        }
        */
        // --- END OF OFFLINE MODEL LOGIC ---
    };


    // --- Submit Answer to AI ---
    // (This code is from your file, it's correct)
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
            const response = await fetch('/api/mock-interview/start', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationHistory: newHistory, role, experience }),
            });
            if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
            const data = await response.json();
            setCurrentQuestion(data.reply);
            setConversationHistory(prev => [...prev, { role: 'model', content: data.reply }]);
            setTranscript(""); // Clear textarea
        } catch (err) {
            console.error("Failed to submit answer:", err);
            setError("Failed to get AI response. Please try submitting again.");
            setConversationHistory(prev => prev.slice(0, -1)); // Revert history
        } finally {
            setIsLoadingAI(false);
        }
    };

    // --- Utility Functions ---
    // (This code is from your file, it's correct)
    const handleResetTranscript = () => setTranscript("");
    const handleSpeakQuestion = () => {
        if (currentQuestion && typeof SpeechSynthesisUtterance !== 'undefined') {
            try {
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
        // Stop browser recording
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        // Stop offline recording (if it was running)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setIsMicRecording(false);
        setView('setup'); 
        setCurrentQuestion("");
        setConversationHistory([]);
        setTranscript("");
        setError(null);
    };

    // --- Render Logic ---
    if (view === 'setup') {
        return (
            // (Your setup JSX is correct, no changes needed)
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
                        disabled={isLoadingAI}
                     >
                        {isLoadingAI ? "Starting..." : "Begin Interview"}
                    </button>
                    {error && <p className="error-feedback setup-error">{error}</p>}
                </div>
            </div>
        );
    }

    // --- 5. MODIFIED Interview View JSX ---
    return (
        <div className="interview-container session-page">
            <div className="top-bar">
                {/* Removed isLoadingSTT from disabled prop */}
                <button className="back-btn" onClick={handleBack} disabled={isLoadingAI}>← End Session</button>
                <p className="interview-title">AI Mock Interview</p>
            </div>

            <SplitPane split="vertical" defaultSize="50%" minSize={300} maxSize={-300} className="main-split-pane">
                <div className="video-panel user-panel">
                    <SplitPane split="horizontal" defaultSize="60%" minSize={150} maxSize={-150} >
                        <div className="pane-content video-pane">
                            <div className="video-feed-container">
                                {isCameraOn ? (
                                    <video ref={videoRef} className="video-feed" autoPlay muted></video>
                                ) : (
                                    <div className="video-placeholder">Camera starting...</div>
                                )}
                            </div>
                        </div>
                        <div className="pane-content transcript-pane">
                            <div className="transcript-box">
                                <p><strong>Your Answer:</strong></p>
                                <textarea
                                    className="transcript-textarea"
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    placeholder="Type or click 'Start Mic' to speak..."
                                    // Removed isLoadingSTT from disabled prop
                                    disabled={isLoadingAI || isMicRecording}
                                />
                                
                                {/* Simplified status message */}
                                <p className={`ai-feedback model-status ${isMicRecording ? 'listening' : ''}`}>
                                     {isMicRecording ? 'Listening...' : ''}
                                     {/* --- OFFLINE MODEL STATUS (Commented out) ---
                                        To use this, uncomment the line below and comment out the line above.
                                     */}
                                     {/* {isMicRecording ? 'Listening...' : (isLoadingSTT ? 'Transcribing...' : '')} */}
                                </p>
                                {isLoadingAI && <p className="ai-feedback">Waiting for AI feedback...</p>}
                                {error && <p className="ai-feedback error-feedback">{error}</p>}
                            </div>
                        </div>
                    </SplitPane>
                </div>

                <div className="video-panel ai-panel">
                     <SplitPane split="horizontal" defaultSize="40%" minSize={100} maxSize={-100}>
                        <div className="pane-content avatar-pane">
                            <div className="ai-avatar-container">
                                <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="AI Avatar" className="ai-avatar" />
                                <p className="ai-name">Placify AI Interviewer</p>
                            </div>
                        </div>
                        <div className="pane-content question-pane">
                            <div className="question-display-box">
                                {currentQuestion ? (
                                    <>
                                        <p className="question-text">{currentQuestion}</p>
                                        <button className="speak-question-btn" onClick={handleSpeakQuestion} title="Listen to question">
                                            <Volume2 size={20} />
                                        </button>
                                    </>
                                ) : (
                                     <p className="question-text">Waiting for question...</p>
                                )}
                            </div>
                        </div>
                    </SplitPane>
                </div>
            </SplitPane> 

            {/* --- Controls Bar (Removed isLoadingSTT) --- */}
            <div className="controls-bar">
                 <button
                    className={`control-btn ${isMicRecording ? 'active' : ''}`}
                    onClick={handleToggleMic}
                    disabled={isLoadingAI || !isCameraOn}
                 >
                    {isMicRecording ? "Stop Mic" : "Start Mic"}
                 </button>
                <button className="control-btn" onClick={handleSpeakQuestion} disabled={isLoadingAI || !isCameraOn || !currentQuestion}>Listen</button>
                <button className="control-btn" onClick={() => setShowDoubtChat(!showDoubtChat)} disabled={isLoadingAI || !isCameraOn}>Ask Doubt</button>
                <button className="control-btn" onClick={handleResetTranscript} disabled={isLoadingAI || !isCameraOn}>Reset</button>
                <button className="control-btn submit-btn" onClick={handleSubmitAnswer} disabled={isLoadingAI || !isCameraOn || !transcript.trim()}>
                    {isLoadingAI ? "Submitting..." : "Submit Answer"}
                </button>
            </div>

             {/* Doubt Chat Window (No changes) */}
             {showDoubtChat && (
                 <div className="doubt-chat-window">
                     <div className="chat-header">
                         <p>Ask for Clarification</p>
                         <button onClick={() => setShowDoubtChat(false)}>&times;</button>
                     </div>
                     <div className="chat-messages"> <p className="ai-chat-msg">AI: How can I help?</p> </div>
                     <div className="chat-input"> <input type="text" placeholder="Type..." /> <button>Send</button> </div>
                 </div>
             )}
        </div>
    );
};

 export default AIMockInterviewSession; // This line is in your file, but commented out in the prompt
