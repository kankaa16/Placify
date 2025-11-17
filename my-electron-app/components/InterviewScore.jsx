import { useLocation } from "react-router-dom";

export default function InterviewScore() {
  const { state } = useLocation();

  return (
    <div className="score-container">
      <h1>Your Interview Score</h1>

      <p>Technical: {state.technicalScore}</p>
      <p>Communication: {state.communicationScore}</p>
      <p>Confidence: {state.confidenceScore}</p>
      <h2>Overall: {state.overallScore}</h2>

      <p>{state.feedback}</p>
    </div>
  );
}
