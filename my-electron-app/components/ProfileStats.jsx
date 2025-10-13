import React, { useState } from "react";
import PlatformCard from "./PlatformCard.jsx";
import Charts from "./Charts.jsx";
import Heatmap from "./Heatmap.jsx"; // optional if you want a separate component
import axios from "axios";
import { normalizePlatform } from "../src/utilis/normalizePlatformData.js";
import "./ProfileStats.css";

export default function ProfileStats() {
  const [handles, setHandles] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
    hackerrank: "",
    atcoder: "",
    github: "",
    huggingface: "",
  });

  const [readinessScore, setReadinessScore] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMap, setErrorMap] = useState({});

 const calculateReadinessScore = (stats) => {
  const maxDSAPoints = 600; // Max weighted points for DSA (can adjust)
  const maxCommits = 150;   // Max commits for dev score

  // DSA: LeetCode difficulty-weighted + Codeforces total
  const lc = stats.leetcode || {};
  const cf = stats.codeforces || {};
  const lcPoints = (lc.easySolved || 0) * 1 + (lc.mediumSolved || 0) * 2 + (lc.hardSolved || 0) * 3;
  const cfPoints = cf.totalSolved || 0; // each CF question = 1 point
  const totalDSAPoints = lcPoints + cfPoints;
  const dsaScore = Math.min(totalDSAPoints / maxDSAPoints, 1) * 10;

  // Dev: GitHub commits
  const githubCommits = stats.github?.totalContributions || 0;
  const devScore = Math.min(githubCommits / maxCommits, 1) * 10;

  // Weighted readiness: 60% DSA, 40% Dev
  const readiness = dsaScore * 0.6 + devScore * 0.4;
  return Math.min(Math.round(readiness * 10) / 10, 10);
};




  const platforms = [
    { key: "leetcode", color: "#FFA116", label: "LeetCode" },
    { key: "codeforces", color: "#1F8ACB", label: "Codeforces" },
    { key: "codechef", color: "#A9A9A9", label: "CodeChef" },
    { key: "atcoder", color: "#FF6B6B", label: "AtCoder" },
    { key: "github", color: "#6E5494", label: "GitHub" },
  ];

  const handleFetch = async () => {
    setLoading(true);
    const baseURL = "http://localhost:5000/api";
    const map = {};
    const errors = {};

    try {
      await Promise.all(
        platforms.map(async (p) => {
          if (!handles[p.key]) return;

          let url = "";
          switch (p.key) {
            case "codeforces":
              url = `${baseURL}/codeforces/${handles[p.key]}`;
              break;
            case "github":
              url = `${baseURL}/github/${handles[p.key]}`;
              break;
            default:
              url = `${baseURL}/${p.key}/${handles[p.key]}`;
          }

          try {
            const { data } = await axios.get(url);
            map[p.key] = normalizePlatform(data, p.key);
          } catch (err) {
            console.error(`${p.key} fetch failed:`, err.message);
            errors[p.key] = `Failed to fetch ${p.label} stats`;
            map[p.key] = null;
          }
        })
      );

      setStats(map);
      setErrorMap(errors);
      if (Object.keys(map).length > 0) {
  const score = calculateReadinessScore(map);
setReadinessScore(score);
}
    } catch (e) {
      console.error("Unexpected error:", e);
    }

    setLoading(false);
  };

  return (
    <div className="profile-container">
      <div className="back-btn" onClick={() => window.history.back()}>
  ×
</div>

      <h1 className="profile-title">Profile Tracker</h1>

      <div className="inputs-grid">
        {platforms.map((p) => (
          <div key={p.key} className="input-box">
            <label>{p.label} Username</label>
            <input
              type="text"
              placeholder={`Enter ${p.label} handle`}
              value={handles[p.key]}
              onChange={(e) => setHandles({ ...handles, [p.key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      <button onClick={handleFetch} disabled={loading} className="fetch-btn">
        {loading ? "Fetching..." : "Fetch Stats"}
      </button>

{readinessScore !== null && (
  <div className="readiness-score">
    <h2>Your Readiness Score: {readinessScore}/10</h2>
  </div>
)}


      {/* CARDS GRID */}
      <div className="cards-grid">
        {platforms.map(
          (p) =>
            handles[p.key] &&
            (stats[p.key] ? (
              <PlatformCard key={p.key} name={p.key} stats={stats[p.key]} color={p.color} />
            ) : (
              errorMap[p.key] && (
                <div key={p.key} className="error-card">
                  <p>{errorMap[p.key]}</p>
                </div>
              )
            ))
        )}

        {/* GitHub Pull Requests */}
        {stats.github?.pullRequestCount > 0 && (
          <div className="github-prs">
            <strong>Pull requests:</strong> {stats.github.pullRequestCount}
            <ul>
              {stats.github.pullRequests.map((pr) => (
                <li key={pr.id}>
                  <a href={pr.url} target="_blank" rel="noreferrer">
                    {pr.title}
                  </a>
                  <span> — {new Date(pr.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ANALYSIS CHARTS */}
      {Object.keys(stats).length > 0 && (
        <div className="analysis-grid">
          <Charts stats={stats} />
        </div>
      )}

      {/* ACTIVITY HEATMAPS BELOW CHARTS */}
      {/* ACTIVITY HEATMAPS BELOW CHARTS */}
{Object.keys(stats).length > 0 && (
  <div className="heatmaps-container">
    {platforms.map(
      (p) =>
        handles[p.key] &&
        stats[p.key] &&
        (p.key === "github") && (
          <div key={`heatmap-${p.key}`} className="heatmap-card">
            <h3>{p.label} Activity</h3>

            {/* GitHub heatmap */}
            {p.key === "github" && stats.github.heatmapImage && (
              <div className="heatmap-wrapper">
                <p>{stats.github.totalContributions || 0} contributions this year</p>
                <img
                  src={stats.github.heatmapImage}
                  alt="GitHub heatmap"
                  className="heatmap-img"
                />
              </div>
            )}

            {/* LeetCode heatmap */}
            {/* {p.key === "leetcode" &&
              stats.leetcode.submissionCalendar &&
              Object.keys(stats.leetcode.submissionCalendar).length > 0 && (
                <div className="heatmap-wrapper">
                  <p>
                    {Object.values(stats.leetcode.submissionCalendar).reduce(
                      (a, b) => a + b,
                      0
                    )}{" "}
                    submissions this year
                  </p>
                  <div className="heatmap-placeholder">
                    <p>🟩 LeetCode-style heatmap coming soon</p>
                  </div>
                </div>
              )} */}
          </div>
        )
    )}
  </div>
)}

    </div>
  );
}
