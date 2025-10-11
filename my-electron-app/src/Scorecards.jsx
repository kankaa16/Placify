import React, { useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import './Scorecards.css';

const platformColors = {
  leetcode: "#FFA116",
  codeforces: "#1F8ACB",
  codechef: "#5E9EFF",
  hackerrank: "#2EC4B6",
  atcoder: "#FF6B6B",
  github: "#6E5494",
  huggingface: "#F9A826"
};

const Scorecards = () => {
  const [handles, setHandles] = useState({
    leetcode: "", codeforces: "", codechef: "", hackerrank: "", atcoder: "", github: "", huggingface: ""
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    const baseURL = "http://localhost:5000/api";
    const fetchers = {
      leetcode: handles.leetcode && `${baseURL}/leetcode/${handles.leetcode}`,
      codeforces: handles.codeforces && `${baseURL}/codeforces/${handles.codeforces}`,
      codechef: handles.codechef && `${baseURL}/codechef/${handles.codechef}`,
      hackerrank: handles.hackerrank && `${baseURL}/hackerrank/${handles.hackerrank}`,
      atcoder: handles.atcoder && `${baseURL}/atcoder/${handles.atcoder}`,
      github: handles.github && `${baseURL}/github/${handles.github}`,
      huggingface: handles.huggingface && `${baseURL}/huggingface/${handles.huggingface}`
    };

    const results = {};
    await Promise.all(
      Object.entries(fetchers)
        .filter(([_, url]) => url)
        .map(async ([key, url]) => {
          try {
            const { data } = await axios.get(url);
            results[key] = data;
          } catch {
            results[key] = { error: `${key} fetch failed` };
          }
        })
    );
    setStats(results);
    setLoading(false);
  };

  const renderCPCard = (platform, data) => {
    if (!data) return null;

    const pieData = platform === "leetcode" ? [
      { name: "Easy", value: data.easySolved || 0 },
      { name: "Medium", value: data.mediumSolved || 0 },
      { name: "Hard", value: data.hardSolved || 0 }
    ] : platform === "codechef" ? [
      { name: "Stars", value: data.stars || 0 },
      { name: "Rest", value: 5 - (data.stars || 0) }
    ] : [];

    return (
      <div className="card" key={platform}>
        <div className="card-header">
          <div className="card-icon" style={{ backgroundColor: platformColors[platform] }}>
            {platform.charAt(0).toUpperCase()}
          </div>
          <h2>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h2>
        </div>

        <div className="card-body">
          {Object.entries(data).map(([k,v]) => (
            <p key={k}><span>{k.replace(/([A-Z])/g," $1")}:</span> <span>{v ?? 0}</span></p>
          ))}
        </div>

        {pieData.length > 0 && (
          <div className="chart-wrapper" style={{ height: 150 }}>
            <PieChart width={150} height={150}>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} paddingAngle={4}>
                {pieData.map((entry, idx) => <Cell key={idx} fill={platformColors[platform]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        )}
      </div>
    );
  };

  const renderDevCard = (platform, data) => {
    if (!data) return null;

    const barData = platform === "github" ? [
      { type: "Repos", value: data.repos || 0 },
      { type: "Followers", value: data.followers || 0 },
      { type: "Following", value: data.following || 0 }
    ] : [];

    return (
      <div className="card" key={platform}>
        <div className="card-header">
          <div className="card-icon" style={{ backgroundColor: platformColors[platform] }}>
            {platform.charAt(0).toUpperCase()}
          </div>
          <h2>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h2>
        </div>

        <div className="card-body">
          {Object.entries(data).map(([k,v]) => (
            <p key={k}><span>{k.replace(/([A-Z])/g," $1")}:</span> <span>{v ?? 0}</span></p>
          ))}
        </div>

        {barData.length > 0 && (
          <div className="chart-wrapper" style={{ height: 150 }}>
            <BarChart width={250} height={150} data={barData} margin={{ top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444"/>
              <XAxis dataKey="type" stroke="#fff"/>
              <YAxis stroke="#fff"/>
              <Tooltip/>
              <Bar dataKey="value" fill={platformColors[platform]} barSize={20}/>
            </BarChart>
          </div>
        )}
      </div>
    );
  };

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

      <button className="fetch-button" onClick={fetchStats}>
        {loading ? "Fetching..." : "Fetch Stats"}
      </button>

      {stats && (
        <>
          <h2>Competitive Programming Stats</h2>
          <div className="card-grid">
            {["leetcode","codeforces","codechef","hackerrank","atcoder"].map(p => renderCPCard(p, stats[p]))}
          </div>

          <h2>Development Stats</h2>
          <div className="card-grid">
            {["github","huggingface"].map(p => renderDevCard(p, stats[p]))}
          </div>
        </>
      )}
    </div>
  );
};

export default Scorecards;
