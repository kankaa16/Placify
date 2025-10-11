// src/components/PlatformCard.jsx
import React from "react";
import "./PlatformCard.css";

function getTotalSolved(data) {
  if (!data) return 0;
  const easy = Number(data.easySolved || data.easy || (data.contributions && data.contributions.easy) || 0);
  const medium = Number(data.mediumSolved || data.medium || (data.contributions && data.contributions.medium) || 0);
  const hard = Number(data.hardSolved || data.hard || (data.contributions && data.contributions.hard) || 0);
  let total = easy + medium + hard;
  if (!total && typeof data.solvedCount === "number") total = data.solvedCount;
  if (!total && typeof data.totalSolved === "number") total = data.totalSolved;
  if (!total && Array.isArray(data.problemsSolved)) total = data.problemsSolved.length;
  return total;
}

export default function PlatformCard({ name, stats, color }) {
  const total = getTotalSolved(stats);
  return (
    <div className="platform-card">
      <div className="card-header">
        <h2 style={{ color }}>{name.charAt(0).toUpperCase() + name.slice(1)}</h2>
        <div className="total-badge">{total}</div>
      </div>

      <div className="stats-list">
        {stats && Object.entries(stats).map(([key, val]) => (
          <p key={key}>
            <span>{key.replace(/_/g, " ")}</span>
            <span>{String(val)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
