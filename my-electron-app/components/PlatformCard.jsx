import React from "react";
import "./PlatformCard.css";

export default function PlatformCard({ name, stats, color }) {
  const prettyName = name.charAt(0).toUpperCase() + name.slice(1);

  const isGitHub = name === "github";
  const isLeetCode = name === "leetcode";

  return (
    <div className="platform-card" style={{ borderTop: `5px solid ${color}` }}>
      <h2>{prettyName}</h2>

      <div className="stats">
        {Object.entries(stats)
          .filter(
            ([key, value]) =>
              !["contributionsCalendar", "submissionCalendar", "heatmapImage"].includes(key) &&
              (typeof value === "string" || typeof value === "number")
          )
          .map(([key, value]) => (
            <p key={key}>
              <strong>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:
              </strong>{" "}
              {value}
            </p>
          ))}
      </div>

      {/* GitHub heatmap */}
      {isGitHub && stats.heatmapImage && (
        <div className="heatmap-section">
          <h3>GitHub Activity</h3>
          <p className="activity-count">
            {stats.totalContributions || 0} contributions this year
          </p>
          <div className="heatmap-wrapper">
            <img
              src={stats.heatmapImage}
              alt="GitHub heatmap"
              className="heatmap-img"
            />
          </div>
        </div>
      )}

      {/* LeetCode heatmap */}
      {isLeetCode &&
        stats.submissionCalendar &&
        Object.keys(stats.submissionCalendar).length > 0 && (
          <div className="heatmap-section">
            <h3>LeetCode Activity</h3>
            <p className="activity-count">
              {Object.values(stats.submissionCalendar).reduce(
                (a, b) => a + b,
                0
              )}{" "}
              submissions this year
            </p>
            <div className="heatmap-placeholder">
              <p>🟩 LeetCode-style heatmap coming soon</p>
            </div>
          </div>
        )}
    </div>
  );
}
