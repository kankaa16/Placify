import React, { useEffect, useState } from "react";
import axios from "axios";

const Scorecards= ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/score/${userId}`)
      .then(res => setUser(res.data))
      .catch(err => console.log(err));
  }, [userId]);

  if (!user) return <div style={{ color: "#fff" }}>Loading...</div>;

  return (
    <div style={{
      background: "#121212", color: "#fff", padding: "20px", borderRadius: "15px",
      maxWidth: "450px", fontFamily: "Inter, sans-serif", boxShadow: "0 0 15px rgba(0,0,0,0.5)"
    }}>
      <h2>{user.fName} {user.lName} ({user.initials})</h2>
      <p>Readiness Score: <strong>{user.readinessScore}</strong></p>

      <h4>Platforms:</h4>
      <ul>
        {user.platformStats.map(p => (
          <li key={p.platform}>
            <strong>{p.platform.toUpperCase()}</strong> - Solved: {p.solvedProblems}, Contests: {p.contests}, Rating: {p.rating}
          </li>
        ))}
      </ul>

      <h4>Socials:</h4>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {Object.entries(user.socials).map(([key, value]) => {
          if (!value || key === "other") return null;
          return <a key={key} href={value} target="_blank" style={{ color: "#61dafb" }}>{key}</a>;
        })}
      </div>
    </div>
  );
};

export default Scorecards;
