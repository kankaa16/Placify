import React, { useState } from "react";
import PlatformCard from "./PlatformCard.jsx";
import Charts from "./Charts.jsx";
import Heatmap from "./Heatmap.jsx";
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

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMap, setErrorMap] = useState({});

  const platforms = [
    { key: "leetcode", color: "#FFA116", label: "LeetCode" },
    { key: "codeforces", color: "#1F8ACB", label: "Codeforces" },
    { key: "codechef", color: "#5E9EFF", label: "CodeChef" },
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
  } catch (e) {
    console.error("Unexpected error:", e);
  }

  setLoading(false);
};

  return (
    <div className="profile-container">
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
        {stats.github.pullRequests.map(pr => (
          <li key={pr.id}>
            <a href={pr.url} target="_blank" rel="noreferrer">{pr.title}</a>
            <span> — {new Date(pr.created_at).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>


      {Object.keys(stats).length > 0 && (
        <div className="analysis-grid">
          <Charts stats={stats} />
<Heatmap
  stats={Object.fromEntries(
    Object.entries(stats)
      .filter(([k,v]) => v?.contributionsCalendar)
      .map(([k,v]) => [k, { contributionsCalendar: v.contributionsCalendar }])
  )}
  days={365}
/>

        </div>
      )}
    </div>
  );
}
