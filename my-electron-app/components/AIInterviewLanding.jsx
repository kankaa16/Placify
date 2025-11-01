import React from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router
import './AIInterview.css';

const AIInterviewLanding = () => {
    const navigate = useNavigate();

    // Placeholder function to navigate to the session
    const startInterview = () => {
        console.log("Navigating to interview session...");
        navigate('/ai-mock-interview-session'); // Update this path as per your router setup
    };

    return (
        <div className="interview-container landing-page">
            <div className="landing-content">
                <div className="landing-header">
                    <h1 className="landing-title">Placify AI Interview Coach</h1>
                    <p className="landing-subtitle">
                        Step into a realistic interview simulation powered by advanced AI. Practice your skills, get instant feedback, and build the confidence to land your dream job.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3 className="feature-title">Live Video Simulation</h3>
                        <p className="feature-description">Engage face-to-face with our AI interviewer in a split-screen setup to practice your body language and presence.</p>
                    </div>
                    <div className="feature-card">
                        <h3 className="feature-title">Speech Recognition</h3>
                        <p className="feature-description">Answer questions naturally by speaking. Our AI transcribes and analyzes your spoken answers in real-time.</p>
                    </div>
                    <div className="feature-card">
                        <h3 className="feature-title">Text-to-Speech Questions</h3>
                        <p className="feature-description">Listen to the interviewer's questions just like in a real conversation, helping you focus on your response.</p>
                    </div>
                    <div className="feature-card">
                        <h3 className="feature-title">Instant Doubt Clarification</h3>
                        <p className="feature-description">Confused by a question? Use the integrated chat to ask our Gemini-powered AI for clarification without breaking the flow.</p>
                    </div>
                </div>

                <div className="landing-footer">
                    <p className="readiness-check">Are you ready to begin?</p>
                    <button className="start-interview-btn" onClick={startInterview}>
                        Start Your Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIInterviewLanding;
