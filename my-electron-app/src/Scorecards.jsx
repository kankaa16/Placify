import React, { useState } from "react";
import axios from "axios";
import { SiLeetcode, SiCodeforces, SiCodechef, SiGithub } from "react-icons/si";
import { FaRobot } from "react-icons/fa";
import "./Scorecards.css";

const platformMeta = {
  leetcode: { name: "LeetCode", Icon: SiLeetcode },
  codeforces: { name: "Codeforces", Icon: SiCodeforces },
  codechef: { name: "CodeChef", Icon: SiCodechef },
  github: { name: "GitHub", Icon: SiGithub },
  huggingface: { name: "HuggingFace", Icon: FaRobot },
};

const renderLeetCodeStats = (data) => {
  if (!data) return null;

  const {
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    acceptanceRate,
    ranking,
    contributionPoints,
    reputation,
    submissionCalendar,
  } = data;

  const totalSubmissions = submissionCalendar
    ? Object.values(submissionCalendar).reduce((acc, v) => acc + v, 0)
    : 0;

  return (
    <>
      <p><strong>Total Solved:</strong> {totalSolved}</p>
      <p><strong>Easy Solved:</strong> {easySolved}</p>
      <p><strong>Medium Solved:</strong> {mediumSolved}</p>
      <p><strong>Hard Solved:</strong> {hardSolved}</p>
      <p><strong>Acceptance Rate:</strong> {acceptanceRate}%</p>
      <p><strong>Ranking:</strong> {ranking}</p>
      <p><strong>Contribution Points:</strong> {contributionPoints}</p>
      <p><strong>Reputation:</strong> {reputation}</p>
      <p><strong>Total Submissions:</strong> {totalSubmissions}</p>
    </>
  );
};

export default function Scorecards() {
  const [handles, setHandles] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
    github: "",
    huggingface: "",
  });

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setHandles({ ...handles, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fetchedStats = {};

    for (const platform of Object.keys(handles)) {
      if (!handles[platform]) continue;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/${platform}/${handles[platform]}`
        );
        fetchedStats[platform] = res.data;
      } catch (err) {
        console.log(platform, err.message);
        fetchedStats[platform] = { error: "fetch failed" };
      }
    }

    setStats(fetchedStats);
    setLoading(false);
  };

  const renderStatValue = (platform, key, value) => {
    if (value === null || value === undefined) return "N/A";

    // Special handling for LeetCode
    if (platform === "leetcode") return renderLeetCodeStats(stats.leetcode);

    if (typeof value === "object") return JSON.stringify(value);
    return value.toString();
  };

  return (
    <div className="score-root">
      <form className="handle-form" onSubmit={handleSubmit}>
        {Object.keys(handles).map((platform) => (
          <div key={platform} className="handle-input">
            <label>{platformMeta[platform]?.name || platform}</label>
            <input
              type="text"
              name={platform}
              value={handles[platform]}
              onChange={handleChange}
              placeholder={`Enter your ${platform} handle`}
            />
          </div>
        ))}
        <button type="submit">Fetch Stats</button>
      </form>

      {loading && <p>Loading stats...</p>}

      <div className="cards-grid">
        {Object.entries(stats).map(([platform, data]) => {
          const Icon = platformMeta[platform]?.Icon || FaRobot;
          return (
            <div key={platform} className="platform-card">
              <div className="card-head">
                <Icon size={28} />
                <div>
                  <h3>{platformMeta[platform]?.name || platform}</h3>
                  <p>{handles[platform]}</p>
                </div>
              </div>
              <div className="card-body">
                {data.error ? (
                  <p>{data.error}</p>
                ) : platform === "leetcode" ? (
                  renderLeetCodeStats(data)
                ) : (
                  Object.entries(data).map(([k, v]) => (
                    <p key={k}>
                      <strong>{k}:</strong> {renderStatValue(platform, k, v)}
                    </p>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
