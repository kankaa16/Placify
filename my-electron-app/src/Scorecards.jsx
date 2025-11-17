import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Scorecards.css";

import leetIcon from "./assets/leetcode.svg";
import cfIcon from "./assets/code-forces.svg";
import ccIcon from "./assets/codechef.svg";
import atIcon from "./assets/atcoder.svg";
import ghIcon from "./assets/github-logo.svg";

const icons = {
  leetcode: leetIcon,
  codeforces: cfIcon,
  codechef: ccIcon,
  atcoder: atIcon,
  github: ghIcon
};

axios.defaults.headers.common["Authorization"] =
  "Bearer " + localStorage.getItem("token");

export default function Scorecards() {
  const userId = localStorage.getItem("userId");

  const [handles, setHandles] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
    atcoder: "",
    github: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/score/${userId}`
        );

        const saved = data.socials || {};
        setHandles(prev => ({ ...prev, ...saved }));

        const newUser = Object.values(saved).every(v => !v);
        setEditMode(newUser);
      } catch {
        setEditMode(true);
      }
      setLoading(false);
    }

    loadSaved();
  }, []);

  const saveHandles = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/score/save-handles/${userId}`,
        handles
      );
      setEditMode(false);
    } catch (err) {
      console.log("Save failed", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="score-wrapper">

      <h1 className="heading">Platform IDs</h1>

      {!editMode && (
        <button className="edit-btn" onClick={() => setEditMode(true)}>
          Edit
        </button>
      )}

      <div className="id-card-box">
        {Object.keys(handles).map(platform => (
          <div className="mini-card" key={platform}>
            <img src={icons[platform]} className="platform-icon" />

            <div>
              <div className="id-value">
                {handles[platform] || "Not set"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editMode && (
        <div className="overlay">
          <div className="edit-modal">
            <h2>Edit IDs</h2>

            {Object.keys(handles).map(platform => (
              <div key={platform} className="edit-row">
                <img src={icons[platform]} className="edit-icon" />
                <input
                  type="text"
                  placeholder={`${platform} username`}
                  value={handles[platform]}
                  onChange={e =>
                    setHandles({ ...handles, [platform]: e.target.value })
                  }
                />
              </div>
            ))}

            <button className="save-modal-btn" onClick={saveHandles}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
