import React from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import "./resume.css";

const ATSMeter = ({ score }) => {
  const data = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: ["#ff9800", "#2b2b2b"],
        borderWidth: 0,
        cutout: "70%",
        rotation: -90,
        circumference: 180,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="ats-gauge-container">
      <Doughnut data={data} options={options} />
      <div className="ats-gauge-score">{score}/100</div>
    </div>
  );
};

export default ATSMeter;
