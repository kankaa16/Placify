// src/components/Charts.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Charts({ stats = {} }) {
  const lc = stats.leetcode || {};

  const easy = lc.easySolved || 0;
  const medium = lc.mediumSolved || 0;
  const hard = lc.hardSolved || 0;
  const totalLC = easy + medium + hard;

  const donutData = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        data: [easy, medium, hard],
        backgroundColor: ["#28c76f", "#ffb020", "#ff5c7c"],
        hoverOffset: 6,
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="charts-wrap">
      
      {/* left side LC donut */}
      <div className="chart-card donut-small">
        <h4 className="chart-title">LeetCode Breakdown</h4>
        <Doughnut data={donutData} />
      </div>

      {/* right side progress beautified */}
      <div className="chart-card progress-card">
        <h4 className="chart-title">LC Progress</h4>

        <div className="progress-info">
          <span className="big-num">{totalLC}</span>
          <span className="label">questions solved</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min((totalLC / 2500) * 100, 100)}%`
            }}
          ></div>
        </div>

        <div className="progress-foot">
          out of approx 2500 total problems
        </div>
      </div>

    </div>
  );
}
