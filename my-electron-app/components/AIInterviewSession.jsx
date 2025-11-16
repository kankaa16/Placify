import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SplitPane from 'react-split-pane'; // Ensure this is installed
import './AIInterview.css'; // Your main CSS
import { Volume2 } from 'lucide-react'; // Example icon library

// --- 1. IMPORT THE AESTHETIC EDITOR ---
import Editor from 'react-simple-code-editor'; // From the library
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript'; // Load JS syntax highlighting
// --- This is the key for the aesthetic: a dark theme ---
import 'prismjs/themes/prism-tomorrow.css'; // This CSS file provides the "VS Code" look

// --- 2. SETUP BROWSER SPEECH RECOGNITION ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const AIMockInterviewSession = () => {
    // --- State Variables ---
    const [view, setView] = useState('setup'); // 'setup' or 'interview'
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMicRecording, setIsMicRecording] = useState(false); // Tracks mic recording state
    const [showDoubtChat, setShowDoubtChat] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [transcript, setTranscript] = useState(""); // This state will hold our code/text
    const [conversationHistory, setConversationHistory] = useState([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false); // Loading state for AI responses
    const [error, setError] = useState(null);
    const [role, setRole] = useState("Software Engineer");
    const [experience, setExperience] = useState("Internship");

    // --- NEW: State for editor mode ---
    const [editorMode, setEditorMode] = useState('code'); // 'code' or 'text'

    // --- Refs ---
    const videoRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const recognitionRef = useRef(null); // Ref for browser speech API
    const navigate = useNavigate();

    // --- Effect for Camera & Mic Permissions ---
    useEffect(() => {
        let localStream = null;
        async function startMedia() {
          try {
            // Get both video and audio
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStream = stream;
            mediaStreamRef.current = stream; // Store the full stream
            if (videoRef.current) {
              // Create a video-only stream for the preview to prevent audio feedback
              const videoStream = new MediaStream(stream.getVideoTracks());
              videoRef.current.srcObject = videoStream;
            }
            setIsCameraOn(true);
          } catch (err) {
            console.error('Camera/Mic error:', err);
            setError('Could not access camera or microphone. Check permissions.');
            setView('setup');
          }
        }
    
        if (view === 'interview' && !isCameraOn) {
          startMedia();
        }
    
        return () => {
          // Cleanup: Stop all tracks
          if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
          }
          if (videoRef.current) videoRef.current.srcObject = null;
          setIsCameraOn(false);
        };
      }, [view]);

    // --- EFFECT TO SETUP BROWSER SPEECH API ---
    useEffect(() => {
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true; 
            recognitionRef.current.interimResults = true; 
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => (prev + " " + finalTranscript).trim());
                }
            };

            recognitionRef.current.onend = () => {
                setIsMicRecording(false);
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
    }, []); // Runs only once

    // --- Start Interview Flow ---
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
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            setCurrentQuestion(data.reply || '');
            setConversationHistory([{ role: 'model', content: data.reply || '' }]);
        } catch (err) {
            console.error('Failed to start interview:', err);
            setError('Could not start the interview.');
            setCurrentQuestion('Error: Could not start interview.');
            setView('setup');
        } finally {
            setIsLoadingAI(false);
        }
    };

    // --- Mic Function (Browser API only) ---
    const handleToggleMic = async () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported on your browser.");
            return;
        }

        if (isMicRecording) {
            recognitionRef.current.stop();
            setIsMicRecording(false);
        } else {
            if (!mediaStreamRef.current) {
                setError("Microphone is not ready.");
                return;
            }
            recognitionRef.current.start();
            setIsMicRecording(true);
        }
    };

    // --- Submit Answer (No changes needed) ---
    const handleSubmitAnswer = async () => {
        if (!transcript.trim()) {
            setError('Answer cannot be empty.');
            return;
        }
        setIsLoadingAI(true);
        setError(null);
        const userMessage = { role: 'user', content: transcript };
        const newHistory = [...conversationHistory, userMessage];
        setConversationHistory(newHistory);

        try {
            const response = await fetch('/api/mock-interview/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationHistory: newHistory, role, experience }),
            });
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            setCurrentQuestion(data.reply || '');
            setConversationHistory(prev => [...prev, { role: 'model', content: data.reply || '' }]);
            setTranscript('');
        } catch (err) {
            console.error('Failed to submit answer:', err);
            setError('Failed to get AI response.');
            setConversationHistory(prev => prev.slice(0, -1));
        } finally {
            setIsLoadingAI(false);
        }
    };

    // --- Utility Functions (No changes) ---
    const handleResetTranscript = () => setTranscript('');

    const handleSpeakQuestion = () => {
        if (!currentQuestion) return;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(currentQuestion);
                utterance.onerror = (e) => console.error('SpeechSynthesis error', e);
                window.speechSynthesis.speak(utterance);
            } catch (err) {
                console.error('Error speaking question:', err);
            }
        }
    };

    const handleBack = () => {
        if (recognitionRef.current) { // Stop browser speech
            recognitionRef.current.stop();
        }
        if (mediaStreamRef.current) { // Stop camera/mic
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }
        setIsMicRecording(false);
        setView('setup');
        setCurrentQuestion('');
        setConversationHistory([]);
        setTranscript('');
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
                    <button className="control-btn start-interview-btn large-start-btn" onClick={handleStartInterviewFlow} disabled={isLoadingAI}>
                        {isLoadingAI ? 'Starting...' : 'Begin Interview'}
                    </button>
                    {error && <p className="error-feedback setup-error">{error}</p>}
                </div>
            </div>
        );
    }

    // --- INTERVIEW VIEW (Using CodeEditor) ---
    return (
        <div className="interview-container session-page">
            <div className="top-bar">
                <button className="back-btn" onClick={handleBack} disabled={isLoadingAI}>← End Session</button>
                <p className="interview-title">AI Mock Interview</p>
            </div>

            <SplitPane split="vertical" defaultSize="50%" minSize={300} maxSize={-300} className="main-split-pane">
                
                {/* --- THIS IS THE LEFT SIDE (AI) --- */}
                <div className="video-panel user-panel">
                    <SplitPane split="horizontal" defaultSize="60%" minSize={150} maxSize={-150}>
                        <div className="pane-content video-pane">
                            <div className="video-feed-container">
                                {isCameraOn ? (
                                    <video ref={videoRef} className="video-feed" autoPlay muted playsInline />
                                ) : (
                                    <div className="video-placeholder">Camera starting...</div>
                                )}
                            </div>
                        </div>

                        <div className="pane-content transcript-pane">
                            <div className="transcript-box">
                                
                                {/* --- EDITOR TABS --- */}
                                <div className="editor-toggle">
                                    <button 
                                        className={`editor-toggle-btn ${editorMode === 'code' ? 'active' : ''}`}
                                        onClick={() => setEditorMode('code')}
                                    >
                                        Code
                                    </button>
                                    <button 
                                        className={`editor-toggle-btn ${editorMode === 'text' ? 'active' : ''}`}
                                        onClick={() => setEditorMode('text')}
                                    >
                                        Text
                                    </button>
                                </div>
                                {/* --- END OF TABS --- */}

                                {editorMode === 'code' ? (
                                    // --- 3. THIS IS THE CORRECTED EDITOR ---
                                    <div className="editor-container">
                                        <Editor
                                            value={transcript}
                                            // THIS IS THE FIX: Use onValueChange
                                            onValueChange={code => setTranscript(code)}
                                            highlight={code => highlight(code, languages.js, 'js')}
                                            padding={15}
                                            className="code-editor-area"
                                            placeholder="Type or paste your code here..."
                                            disabled={isLoadingAI || isMicRecording}
                                            style={{
                                                fontFamily: '"Fira Code", "Courier New", monospace',
                                                fontSize: 15,
                                                minHeight: '100%',
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <textarea
                                        className="transcript-textarea"
                                        value={transcript}
                                        onChange={(e) => setTranscript(e.target.value)}
                                        placeholder="Type or click 'Start Mic' to speak..."
                                        disabled={isLoadingAI || isMicRecording}
                                    />
                                )}
                                
                                <p className={`ai-feedback model-status ${isMicRecording ? 'listening' : ''}`}>
                                    {isMicRecording ? 'Listening...' : ''}
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
                
                {/* --- THIS IS THE RIGHT SIDE (USER) --- */}
                

            </SplitPane>

            <div className="controls-bar">
                <button className={`control-btn ${isMicRecording ? 'active' : ''}`} onClick={handleToggleMic} disabled={isLoadingAI || !isCameraOn}>
                    {isMicRecording ? 'Stop Mic' : 'Start Mic'}
                </button>
                <button className="control-btn" onClick={handleSpeakQuestion} disabled={isLoadingAI || !isCameraOn || !currentQuestion}>Listen</button>
                <button className="control-btn" onClick={() => setShowDoubtChat(!showDoubtChat)} disabled={isLoadingAI || !isCameraOn}>Ask Doubt</button>
                <button className="control-btn" onClick={handleResetTranscript} disabled={isLoadingAI || !isCameraOn}>Reset</button>
                <button className="control-btn submit-btn" onClick={handleSubmitAnswer} disabled={isLoadingAI || !isCameraOn || !transcript.trim()}>
                    {isLoadingAI ? 'Submitting...' : 'Submit Answer'}
                </button>
            </div>

            {showDoubtChat && (
                <div className="doubt-chat-window">
                    <div className="chat-header">
                        <p>Ask for Clarification</p>
                        <button onClick={() => setShowDoubtChat(false)}>&times;</button>
                    </div>
                    <div className="chat-messages">
                        <p className="ai-chat-msg">AI: How can I help?</p>
                    </div>
                    <div className="chat-input">
                        <input type="text" placeholder="Type..." />
                        <button>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AIMockInterviewSession;