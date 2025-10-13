import React from "react";
import "./PlatformCard.css";

export default function PlatformCard({ name, stats, color }) {
  const prettyName = name.charAt(0).toUpperCase() + name.slice(1);

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

    </div>
  );
}
