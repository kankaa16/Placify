import React from "react";
import "./resume.css";
import { Bar } from "react-chartjs-2";

import ATSMeter from "./ATSChart.jsx";

const ResumeResult = ({ result }) => {
  if (!result) return null;

  const { atsScore = 0, matchedSkills = [], missingSkills = [], suggestions = [] } = result;

  const barData = {
    labels: [...matchedSkills, ...missingSkills],
    datasets: [
      {
        label: "Skills Analysis",
        data: [...matchedSkills.map(() => 1), ...missingSkills.map(() => 0)],
        backgroundColor: [...matchedSkills.map(() => "#4caf50"), ...missingSkills.map(() => "#f44336")],
      },
    ],
  };

  return (
    <div className="resume-result">
      <div className="charts">
  <div className="chart">
    <h3>ATS Score</h3>
    <ATSMeter score={atsScore} />
  </div>

  <div className="chart">
    <h3>Matched vs Missing Skills</h3>
    <Bar data={barData} />
  </div>
</div>

      <div className="suggestions">
        <h3>Suggestions to Improve Resume</h3>
        <div className="suggestions-grid">
          {suggestions.map((s, i) => (
            <div key={i} className="suggestion-card">{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeResult;
