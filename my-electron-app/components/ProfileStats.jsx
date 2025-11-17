// src/components/ProfileStats.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Charts from "./Charts.jsx";
import Heatmap from "./Heatmap.jsx";
import "./ProfileStats.css";

// correct relative imports to your src/assets folder
import leetIcon from "../src/assets/leetcode.svg";
import cfIcon from "../src/assets/code-forces.svg";
import ccIcon from "../src/assets/icons8-codechef-48.svg";
import atIcon from "../src/assets/atcoder.svg";
import ghIcon from "../src/assets/github2.svg";
import ReadinessGauge from "./ReadinessGauge.jsx";

// attach token if present
const token = localStorage.getItem("token");
if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

const PLATFORM_META = [
  { key: "leetcode", label: "LeetCode", icon: leetIcon },
  { key: "codeforces", label: "Codeforces", icon: cfIcon },
  { key: "codechef", label: "CodeChef", icon: ccIcon },
  { key: "atcoder", label: "AtCoder", icon: atIcon },
  { key: "github", label: "GitHub", icon: ghIcon }
];

export default function ProfileStats() {
  const userId = localStorage.getItem("userId");

  const [handles, setHandles] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
    atcoder: "",
    github: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingIDs, setLoadingIDs] = useState(true);

  // load saved handles once
  useEffect(() => {
    let mounted = true;
    async function loadIDs() {
      try {
        if (!userId) {
          if (mounted) setEditMode(true);
          return;
        }
        const { data } = await axios.get(`http://localhost:5000/api/score/${userId}`);
        const saved = data?.socials || {};
        if (mounted) {
          setHandles(prev => ({ ...prev, ...saved }));
          const firstTime = Object.values(saved).every(v => !v);
          setEditMode(firstTime);
        }
      } catch (err) {
        if (mounted) setEditMode(true);
      } finally {
        if (mounted) setLoadingIDs(false);
      }
    }
    loadIDs();
    return () => { mounted = false; };
  }, [userId]);

  // save handles and optionally fetch immediately
  const saveIDs = async () => {
    if (!userId) {
      alert("Login first to save ids");
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/score/save-handles/${userId}`, handles, { withCredentials: true });
      setEditMode(false);
      fetchStats();
    } catch (err) {
      console.error("save failed", err);
      alert("Saving failed. Check console.");
    }
  };

  // fetch raw platform stats. result will store raw server response per platform
  // fetch raw platform stats. result will store raw server response per platform



// fetch raw platform stats. result will store raw server response per platform
const fetchStats = async () => {
  if (!userId) {
    alert("Please login first");
    return;
  }

  setLoadingStats(true);

  try {
    const base = "http://localhost:5000/api";
    const result = {};

    await Promise.all(
      PLATFORM_META.map(async p => {
        const handle = (handles[p.key] || "").trim();
        if (!handle) {
          result[p.key] = null;
          return;
        }
        try {
          const { data } = await axios.get(`${base}/${p.key}/${handle}`);
          result[p.key] = data || null;
        } catch {
          result[p.key] = null;
        }
      })
    );

    // normalize
    const normalized = { ...result };

    if (normalized.leetcode) {
  normalized.leetcode.totalSolved = Number(normalized.leetcode.totalSolved || 0);
  normalized.leetcode.totalActiveDays = Number(normalized.leetcode.totalActiveDays || 0);
  normalized.leetcode.rating = Number(normalized.leetcode.contestRating || 0);  
}



    if (normalized.codeforces) {
      normalized.codeforces.totalSolved = Number(normalized.codeforces.totalSolved || 0);
      normalized.codeforces.rating = Number(normalized.codeforces.rating || 0);
    }

    if (normalized.codechef) {
      normalized.codechef.rating = normalized.codechef.rating || normalized.codechef.maxRating || null;
      normalized.codechef.stars = normalized.codechef.stars ?? null;
    }

    if (normalized.github) {
      normalized.github.totalContributions = Number(normalized.github.totalContributions || 0);
      normalized.github.repos = Number(normalized.github.repos || 0);
      normalized.github.pullRequests = Array.isArray(normalized.github.pullRequests)
        ? normalized.github.pullRequests
        : [];
    }

    // extract needed values
    const lcQ = normalized.leetcode?.totalSolved || 0;
    const cfR = normalized.codeforces?.rating || 0;
    const cfSolved = normalized.codeforces?.totalSolved || 0;
    const ghC = normalized.github?.totalContributions || 0;
    const ccStars = normalized.codechef?.stars || 0;

    // CP score (max 3)
    let cpScore = 0;

    // CF rating based score
    if (cfR >= 3000) cpScore += 3;
    else if (cfR >= 2400) cpScore += 2.5;
    else if (cfR >= 2000) cpScore += 2;
    else if (cfR >= 1600) cpScore += 1.5;
    else if (cfR >= 1200) cpScore += 1;

    // solve count LC + CF
    const totalSolved = lcQ + cfSolved;

    if (totalSolved > 3000) cpScore += 1;
    else if (totalSolved > 1000) cpScore += 0.5;

    cpScore = Math.min(cpScore, 3); // cap


    // Dev score (max 2)
    let devScore = 0;

    if (ghC > 500) devScore += 2;
    else if (ghC > 250) devScore += 1.5;
    else if (ghC > 100) devScore += 1;

    // slight boost from CodeChef stars
    if (ccStars >= 2) devScore += 0.3;

    devScore = Math.min(devScore, 2);

    // final readiness score
    let score = cpScore + devScore;

    normalized.readinessScore = Math.round(score * 10) / 10;

    
    setStats(normalized);

await axios.post(
  `http://localhost:5000/api/score/update-readiness/${userId}`,
  { score: normalized.readinessScore },
  { withCredentials: true }
);

  } catch (err) {
    console.error("fetchStats error", err);
    setStats({});

  } finally {
    setLoadingStats(false);
  }
};


  if (loadingIDs) return <div className="ps-loading">Loading…</div>;

  // total questions is leetcode plus codeforces only
  const totalQuestions =
    (Number(stats.leetcode?.totalSolved || 0)) +
    (Number(stats.codeforces?.totalSolved || 0));

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <div className="back" onClick={() => window.history.back()}>X</div>
        <h1 className="title">Profile Tracker</h1>

        <div className="header-actions">
          <button className="btn ghost" onClick={() => setEditMode(true)}>Edit ID's</button>
          <button className="btn primary" onClick={fetchStats} disabled={loadingStats}>
            {loadingStats ? "Fetching…" : "Fetch stats"}
          </button>
        </div>
      </div>

      <section className="ids-row">
        {PLATFORM_META.map(p => (
          <div key={p.key} className="id-mini">
            <img src={p.icon} alt={p.label} className="mini-icon" />
            <div className="mini-body">
              <div className="mini-label">{p.label}</div>
              {editMode ? (
                <input
                  className="mini-input"
                  value={handles[p.key] || ""}
                  onChange={e => setHandles({ ...handles, [p.key]: e.target.value })}
                  placeholder={`enter ${p.label}`}
                />
              ) : (
                <div className="mini-value">{handles[p.key] || <span className="muted">Not set</span>}</div>
              )}
            </div>
          </div>
        ))}

        {editMode && (
          <div className="save-row">
            <button className="btn primary" onClick={saveIDs}>Save ids</button>
            <button className="btn ghost" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        )}
      </section>

      <div className="center-wrapper">
        <section className="top-grid">
          <div className="card big readiness-card">
  <ReadinessGauge score={stats.readinessScore || 0} />
</div>


          <div className="card big">
            <div className="card-title">Total Questions</div>
            <div className="card-value">{totalQuestions}</div>
            <div className="card-sub muted">across LeetCode + Codeforces</div>
          </div>


         
            <div className="heatmap-wrapper">
    <div className="heatmap-title">Competitive Programming Activity</div>
    <div className="heatmap-area">
        <Heatmap stats={stats} />
    </div>
</div>


          
        </section>

        <section className="platform-cards">
          {PLATFORM_META.map(p => {
            const s = stats[p.key];
            const isGitHub = p.key === "github";
            return (
              <div key={p.key} className="platform-card">
                <div className="pc-left">
                  <img src={p.icon} className="pc-icon" alt={p.label} />
                  <div>
                    <div className="pc-name">{p.label}</div>
                    <div className="pc-handle">{/* intentionally hidden */}</div>
                  </div>
                </div>

                <div className="pc-right">

  {!s ? (
    <div className="muted small">no data</div>
  ) : (
    <div className="pc-row">

      {/* Solved (skip for GitHub, CodeChef) */}
      {p.key !== "github" && p.key !== "codechef" && p.key !== "atcoder" && (
        <div className="pc-stat">
          <div className="pc-stat-label">Solved</div>
          <div className="pc-stat-value">{s.totalSolved ?? "—"}</div>
        </div>
      )}

      {/* Rating / Stars / Contributions */}
      {p.key === "codechef" && (
  <>
    <div className="pc-stat">
      <div className="pc-stat-label">Rating</div>
      <div className="pc-stat-value">{s.rating ?? "—"}</div>
    </div>

    <div className="pc-stat">
      <div className="pc-stat-label">Stars</div>
      <div className="pc-stat-value">{s.stars ?? "—"}</div>
    </div>
  </>
)}


      {p.key === "github" && (
        <>
          <div className="pc-stat">
            <div className="pc-stat-label">Contributions</div>
            <div className="pc-stat-value">{s.totalContributions}</div>
          </div>

          <div className="pc-stat">
            <div className="pc-stat-label">Repos</div>
            <div className="pc-stat-value">{s.repos}</div>
          </div>
        </>
      )}

      {/* Common rating item for LC, CF, AtCoder */}
      {(p.key === "leetcode" || p.key === "codeforces" || p.key === "atcoder") && (
        <div className="pc-stat">
          <div className="pc-stat-label">Rating</div>
          <div className="pc-stat-value">{s.rating ?? s.contestRating ?? "—"}</div>

        </div>
      )}

    </div>
  )}

</div>

              </div>
            );
          })}
        </section>

        {stats.github?.pullRequests?.length > 0 && (
          <div className="github-pr-list">
            <h3>Pull Requests</h3>
            <ul>
              {stats.github.pullRequests.map(pr => (
                <li key={pr.id} className="pr-item">
                  <a href={pr.url} target="_blank" rel="noreferrer">{pr.title}</a>
                  <span className="pr-date">{new Date(pr.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {stats.github?.heatmapImage && (
  <section className="github-heatmap-wrapper">
    <h2>GitHub Contributions</h2>
    <img
      src={stats.github.heatmapImage}
      className="github-heatmap-img"
      alt="GitHub heatmap"
    />
  </section>
)}


        <section className="charts-area">
          <Charts stats={stats} />
        </section>
      </div>
    </div>
  );
}
