import React from "react";
import "./resumeModern.css";
import { Bar } from "react-chartjs-2";
import ATSMeter from "./ATSChart.jsx";

const ResumeResult = ({ result }) => {
  if (!result) return null;

  const { atsScore, matchedSkills = [], missingSkills = [], suggestions = [], rawText } = result;

  const barData = {
    labels: [...matchedSkills, ...missingSkills],
    datasets: [
      {
        label: "Skill Match",
        data: [...matchedSkills.map(() => 1), ...missingSkills.map(() => 0)],
        backgroundColor: [
          ...matchedSkills.map(() => "#4caf50"),
          ...missingSkills.map(() => "#e74c3c")
        ],
      },
    ],
  };

  return (
    <div className="rr-page">

      {/* top row */}
      <div className="rr-top">
        
        {/* left side = ATS + chart */}
        <div className="rr-left-box">
          <div className="rr-card">
            <h3>ATS Score</h3>
            <ATSMeter score={atsScore} />
          </div>

          <div className="rr-card">
            <h3>Matched vs Missing Skills</h3>
            <Bar data={barData} />
          </div>
        </div>

        {/* right side = keywords + final thoughts */}
        <div className="rr-right-box">
          
          <div className="rr-card">
            <h3>Missing Keywords</h3>
            <div className="rr-badges">
              {missingSkills.length === 0 && <p>No missing keywords</p>}
              {missingSkills.map((skill, i) => (
                <span key={i} className="rr-badge">{skill}</span>
              ))}
            </div>
          </div>

          <div className="rr-card">
            <h3>Final Thoughts</h3>
            <p className="rr-text">{result.finalThoughts || "No summary available"}</p>
          </div>

        </div>
      </div>

      {/* bottom full width */}
      <div className="rr-card rr-bottom">
        <h3>Raw Resume Analysis</h3>
        <pre className="rr-raw">{rawText}</pre>
      </div>

    </div>
  );
};

export default ResumeResult;
