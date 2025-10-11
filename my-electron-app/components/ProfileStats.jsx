import React, { useState } from "react";
import PlatformCard from "./PlatformCard.jsx";
import Charts from "./Charts.jsx";
import Heatmap from "./Heatmap.jsx";
import axios from "axios";
import { normalizePlatform } from '../src/utilis/normalizePlatformData.js';
import "./ProfileStats.css";

export default function ProfileStats() {
  const [handles, setHandles] = useState({
    leetcode:"", codeforces:"", codechef:"", hackerrank:"", atcoder:"", github:"", huggingface:""
  });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const platforms = [
    { key: "leetcode", color: "#FFA116" },
    { key: "codeforces", color: "#1F8ACB" },
    { key: "codechef", color: "#5E9EFF" },
    { key: "hackerrank", color: "#2EC4B6" },
    { key: "atcoder", color: "#FF6B6B" },
    { key: "github", color: "#6E5494" },
    { key: "huggingface", color: "#F9A826" }
  ];

  const handleFetch = async () => {
    setLoading(true);
    const baseURL = "http://localhost:5000/api";
    const map = {};
    try{
      await Promise.all(platforms.map(async p => {
        if(!handles[p.key]) return;
        try{
          const { data } = await axios.get(`${baseURL}/${p.key}/${handles[p.key]}`);
          map[p.key] = normalizePlatform(data, p.key);
        } catch(err){
          console.error(`${p.key} fetch failed`, err.message);
          map[p.key] = null;
        }
      }));
      setStats(map);
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Codolio Profile Tracker</h1>
      <div className="inputs-grid">
        {platforms.map(p=>(
          <div key={p.key} className="input-box">
            <label>{p.key} username</label>
            <input type="text" placeholder={`Enter ${p.key} handle`}
              value={handles[p.key]}
              onChange={e=>setHandles({...handles,[p.key]:e.target.value})}
            />
          </div>
        ))}
      </div>

      <button onClick={handleFetch} disabled={loading} className="fetch-btn">
        {loading ? "Fetching..." : "Fetch Stats"}
      </button>

      <div className="cards-grid">
        {platforms.map(p => handles[p.key] && stats[p.key] && (
          <PlatformCard key={p.key} name={p.key} stats={stats[p.key]} color={p.color}/>
        ))}
      </div>

      <div className="analysis-grid">
        <Charts stats={stats}/>
        <Heatmap stats={stats} days={90}/>
      </div>
    </div>
  )
}
