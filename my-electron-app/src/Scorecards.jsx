import React, { useState } from "react";
import "./Scorecards.css";

const platformColors = {
  leetcode: "#FFA116",
  codeforces: "#1F8ACB",
  codechef: "#5E9EFF",
  atcoder: "#FF6B6B",
  github: "#6E5494"
};

const Scorecards = () => {
  const [handles, setHandles] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
    atcoder: "",
    github: ""
  });

  const renderCard = (platform) => (
    <div className="card" key={platform}>
      <div className="card-header">
        <div className="card-icon" style={{ backgroundColor: platformColors[platform] }}>
          {platform.charAt(0).toUpperCase()}
        </div>
        <h2>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h2>
      </div>
    </div>
  );

  return (
    <div className="scorecards-container">
      <h1>Enter Your Platform Usernames</h1>

      <div className="input-section">
        {Object.keys(handles).map(platform => (
          <input
            key={platform}
            type="text"
            placeholder={`${platform} username`}
            value={handles[platform]}
            onChange={e => setHandles({ ...handles, [platform]: e.target.value })}
          />
        ))}
      </div>

      <h2>Competitive Programming Platforms</h2>
      <div className="card-grid">
        {["leetcode","codeforces","codechef","atcoder"]
          .filter(p => handles[p])
          .map(p => renderCard(p))}
      </div>

      <h2>Development Platforms</h2>
      <div className="card-grid">
        {["github"]
          .filter(p => handles[p])
          .map(p => renderCard(p))}
      </div>
    </div>
  );
};

export default Scorecards;
