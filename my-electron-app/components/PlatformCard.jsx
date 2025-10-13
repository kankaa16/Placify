// src/components/PlatformCard.jsx
import React from "react";
import "./PlatformCard.css";

export default function PlatformCard({ name, stats, color }) {
  if (!stats) return null;

  let displayStats = {};

  if (name === "codechef" || name === "atcoder") {
    displayStats = { rating: stats.rating || stats.highestRating || "N/A" };
  } else if (name === "github") {
    const { repos, followers, following, pullRequestCount } = stats;
    displayStats = { repos, followers, following };
    if (pullRequestCount) displayStats.pullRequestCount = pullRequestCount;
  } else {
    // Copy all stats except unwanted fields
    displayStats = Object.fromEntries(
      Object.entries(stats)
        .filter(([key]) => key !== "contributionsCalendar" && key !== "submissions")
    );
  }

  return (
    <div className="platform-card">
      <div className="card-header">
        <h2 style={{ color }}>{name.charAt(0).toUpperCase() + name.slice(1)}</h2>
      </div>

      <div className="stats-list">
        {Object.entries(displayStats).map(([key, val]) => (
          <p key={key}>
            <span>{key.replace(/_/g, " ")}</span>
            <span>{String(val)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
