import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const emptyStudent = {
  name: "-",
  initials: "-",
  rollNumber: "-",
  department: "-",
  batch: "-",
  status: "-",
  readinessScore: 0,
  contact: { email: "-", phone: "-", location: "-", dob: "-" },
  socials: { portfolio: "#", linkedin: "#", github: "#", leetcode: "#", codeforces: "#", other: "#" },
  academics: { cgpa: 0, backlogs: 0, grade10: "-", grade12: "-", jeeMains: "-" },
  skills: [],
  assessments: { technical: 0, aptitude: 0, communication: 0, coding: 0 },
  certifications: [],
  preferences: { jobTypes: [], locations: [], industries: [] },
};

const normalizeUserFromApi = (user) => {
  if (!user) return emptyStudent;
  const name =
    (user.fName || "").trim() || (user.lName || "").trim()
      ? `${user.fName || ""} ${user.lName || ""}`.trim()
      : user.emailID || "-";
  const initials =
    user.initials ||
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    "-";
  return {
    name,
    initials,
    rollNumber: user.rollNumber || "-",
    department: user.dept || "-",
    batch: user.batch || "-",
    status: user.status || "-",
    readinessScore: typeof user.readinessScore === "number" ? user.readinessScore : 0,
    contact: {
      email: user.emailID || user.contact?.email || "-",
      phone: user.contact?.phone || "-",
      location: user.contact?.location || "-",
      dob: user.contact?.dob || "-",
    },
    socials: {
  portfolio: user.socials?.portfolio || "#",
  linkedin: user.socials?.linkedin || "#",
  github: user.socials?.github || "#",
  leetcode: user.socials?.leetcode || "#",
  codeforces: user.socials?.codeforces || "#",
  other: user.socials?.other || "#",
},

    academics: {
      cgpa: user.academics?.cgpa ?? 0,
      backlogs: user.academics?.backlogs ?? 0,
      grade10: user.academics?.grade10 || "-",
      grade12: user.academics?.grade12 || "-",
      jeeMains: user.academics?.jeeMains || "-",
    },
    assessments: {
      technical: user.assessments?.technical ?? 0,
      aptitude: user.assessments?.aptitude ?? 0,
      communication: user.assessments?.communication ?? 0,
      coding: user.assessments?.coding ?? 0,
    },
    certifications: Array.isArray(user.certifications) ? user.certifications : [],
    skills: Array.isArray(user.skills) ? user.skills : [],
    preferences: {
      jobTypes: Array.isArray(user.preferences?.jobTypes) ? user.preferences.jobTypes : [],
      locations: Array.isArray(user.preferences?.locations) ? user.preferences.locations : [],
      industries: Array.isArray(user.preferences?.industries) ? user.preferences.industries : [],
    },
    _rawUser: user,
  };
};

const buildPayloadForApi = (editable) => {
  const payload = {};

  if (editable.name && editable.name !== "-") {
    const parts = editable.name.trim().split(" ");
    payload.fName = parts.shift() || "";
    payload.lName = parts.join(" ") || "";
  } else {
    payload.fName = "";
    payload.lName = "";
  }

  payload.emailID = editable.contact?.email || "";
  payload.initials = editable.initials || "";
  payload.rollNumber = editable.rollNumber || "";
  payload.dept = editable.department || "";
  payload.batch = editable.batch && editable.batch !== "-" ? editable.batch.toString() : "";
  payload.status = editable.status || "";
  payload.readinessScore = Number(editable.readinessScore) || 0;

  payload.contact = {
    phone: editable.contact?.phone || "",
    location: editable.contact?.location || "",
    dob: editable.contact?.dob || "",
  };

  payload.socials = {
    portfolio: editable.socials?.portfolio || "",
    linkedin: editable.socials?.linkedin || "",
    github: editable.socials?.github || "",
    other: editable.socials?.other || "",
  };

  payload.academics = {
    cgpa: Number(editable.academics?.cgpa) || 0,
    backlogs: Number(editable.academics?.backlogs) || 0,
    grade10: editable.academics?.grade10 || "",
    grade12: editable.academics?.grade12 || "",
    jeeMains: editable.academics?.jeeMains || "",
  };

  
  payload.skills = Array.isArray(editable.skills) ? editable.skills.filter(Boolean) : [];

  payload.assessments = {
    technical: Number(editable.assessments?.technical) || 0,
    aptitude: Number(editable.assessments?.aptitude) || 0,
    communication: Number(editable.assessments?.communication) || 0,
    coding: Number(editable.assessments?.coding) || 0,
  };

  payload.certifications = Array.isArray(editable.certifications)
    ? editable.certifications.map((c) => ({
        name: c.name || "",
        issuer: c.issuer || "",
        completed: c.completed ? Number(c.completed) : undefined,
        validUntil: c.validUntil || undefined,
      }))
    : [];

  payload.preferences = {
    jobTypes: Array.isArray(editable.preferences?.jobTypes) ? editable.preferences.jobTypes.filter(Boolean) : [],
    locations: Array.isArray(editable.preferences?.locations) ? editable.preferences.locations.filter(Boolean) : [],
    industries: Array.isArray(editable.preferences?.industries) ? editable.preferences.industries.filter(Boolean) : [],
  };

  return payload;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(null);


  const [skillsInput, setSkillsInput] = useState("");
  const [customCity, setCustomCity] = useState("");
  const techCities = [
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Chennai",
  "Gurgaon",
  "Noida",
  "Delhi",
  "Kolkata",
  "Ahmedabad",
];
const jobPreferences = ["In-office", "Remote", "Hybrid"];



  useEffect(() => {
  if (isEditing) {
    setSkillsInput(editableData?.skills?.join(", ") || "");
  }
}, [isEditing]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const body = await res.json();
        if (!res.ok) {
          setStudentData(emptyStudent);
          setIsLoading(false);
          return;
        }
        const user = body?.data?.user || body?.data || body?.user || null;
        setStudentData(normalizeUserFromApi(user));
      } catch (err) {
        console.error("fetch user failed", err);
        setStudentData(emptyStudent);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditClick = () => {
  const data = JSON.parse(JSON.stringify(studentData || emptyStudent));
  data.academics = data.academics || { cgpa: 0, backlogs: 0, grade10: "", grade12: "", jeeMains: "" };
  data.preferences = {
    jobTypes: data.preferences?.jobTypes || [],
    locations: data.preferences?.locations || [],
    industries: data.preferences?.industries || []
  };
  setEditableData(data);
  setIsEditing(true);
};

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditableData(null);
  };
  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = buildPayloadForApi(editableData || {});
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        alert(body.error || "Failed to update profile");
        return;
      }
      const updatedUser = body?.data?.user || body?.user || null;
      const newDisplay = updatedUser ? normalizeUserFromApi(updatedUser) : normalizeUserFromApi({ ...editableData });
      setStudentData(newDisplay);
      setIsEditing(false);
      setEditableData(null);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("save error", err);
      alert("Error while saving profile");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parts = name.split(".");
    if (parts.length === 1) {
      setEditableData((prev) => ({ ...prev, [name]: value }));
      return;
    }
    setEditableData((prev) => {
      const obj = { ...prev };
      let curr = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        curr[parts[i]] = { ...(curr[parts[i]] || {}) };
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = value;
      return obj;
    });
  };

const handleCommaInput = (section, field, value) => {
  const arr = value.split(",").map(s => s.trim()).filter(Boolean);
  setEditableData(prev => {
    if (!field) return { ...prev, [section]: arr }; // for skills array
    return { ...prev, [section]: { ...(prev[section] || {}), [field]: arr } };
  });
};



  const handleCertificationChange = (e, idx) => {
    const { name, value } = e.target;
    setEditableData((prev) => {
      const certs = Array.isArray(prev.certifications) ? [...prev.certifications] : [];
      certs[idx] = { ...(certs[idx] || {}), [name]: value };
      return { ...prev, certifications: certs };
    });
  };
  const addCertification = () => {
    setEditableData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), { name: "", issuer: "", completed: "" }],
    }));
  };
  const removeCertification = (idx) => {
    setEditableData((prev) => {
      const arr = [...(prev.certifications || [])];
      arr.splice(idx, 1);
      return { ...prev, certifications: arr };
    });
  };

  if (isLoading) return <div style={{ color: "white", textAlign: "center", fontSize: "1.8rem", paddingTop: "100px" }}>Loading Profile...</div>;

  const displayData = isEditing ? editableData || emptyStudent : studentData || emptyStudent;

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="close-container"><button className="close-btn" onClick={() => navigate(-1)}>×</button></div>
        <div className="avatar">{displayData.initials || "-"}</div>
        {isEditing ? (
          <div style={{ marginTop: 10 }}>
            <label className="edit-input-label">Full Name</label>
            <input name="name" value={editableData?.name ?? ""} onChange={handleInputChange} className="edit-input" />
            <label className="edit-input-label" style={{ marginTop: 8 }}>Batch</label>
            <input
              name="batch"
              value={editableData?.batch === "-" ? "" : editableData?.batch ?? ""}
              onChange={handleInputChange}
              className="edit-input"
            />
          </div>
        ) : <h1 className="student-name">{displayData.name || "-"}</h1>}
        <div className="roll-number">Roll No: {displayData.rollNumber || "-"}</div>
        <div className="department">{(displayData.department || "-") + " • Batch " + (displayData.batch || "-")}</div>
        <div className={`status-badge ${displayData.status?.toLowerCase() || "unplaced"}`}>{displayData.status || "-"}</div>
        <div className="readiness-score">
          <div className="score-label">Placement Readiness Score</div>
          <div className="score-bar">
            <div className="score-fill" style={{ width: `${displayData.readinessScore || 0}%` }}></div>
            <div className="score-text">{displayData.readinessScore || 0}%</div>
          </div>
        </div>
        {isEditing ? (
          <div style={{ textAlign: "left", marginTop: 20 }}>
            <label className="edit-input-label">Email</label>
            <input name="contact.email" value={editableData?.contact?.email ?? ""} onChange={handleInputChange} className="edit-input" />
            <label className="edit-input-label" style={{ marginTop: 10 }}>Phone</label>
            <input name="contact.phone" value={editableData?.contact?.phone ?? ""} onChange={handleInputChange} className="edit-input" />
            <label className="edit-input-label" style={{ marginTop: 10 }}>Location</label>
            <input name="contact.location" value={editableData?.contact?.location ?? ""} onChange={handleInputChange} className="edit-input" />
            <small style={{ display: "block", marginTop: 6 }}>For multiple preferred locations use Career Preferences locations field below</small>
            <label className="edit-input-label" style={{ marginTop: 10 }}>Date of birth</label>
            <input name="contact.dob" value={editableData?.contact?.dob ?? ""} onChange={handleInputChange} className="edit-input" />
          </div>
        ) : (
          <div className="contact-info">
            <div className="contact-item"><span className="contact-icon">📧</span>{displayData.contact.email || "-"}</div>
            <div className="contact-item"><span className="contact-icon">📱</span>{displayData.contact.phone || "-"}</div>
            <div className="contact-item"><span className="contact-icon">📍</span>{displayData.contact.location || "-"}</div>
            <div className="contact-item"><span className="contact-icon">🎂</span>{displayData.contact.dob || "-"}</div>
          </div>
        )}
        <div className="edit-controls">
          {isEditing ? (
            <>
              <button onClick={handleSaveClick} className="edit-btn save-btn">Save All Changes</button>
              <button onClick={handleCancelClick} className="edit-btn cancel-btn">Cancel</button>
            </>
          ) : <button onClick={handleEditClick} className="edit-btn save-btn">Edit Profile</button>}
        </div>
        {isEditing && (
  <div style={{ textAlign: "left", marginTop: 20 }}>
    <label className="edit-input-label">LinkedIn</label>
    <input
      name="socials.linkedin"
      value={editableData?.socials?.linkedin ?? ""}
      onChange={handleInputChange}
      className="edit-input"
      placeholder="https://linkedin.com/in/yourprofile"
    />

    <label className="edit-input-label" style={{ marginTop: 8 }}>LeetCode</label>
    <input
      name="socials.leetcode"
      value={editableData?.socials?.leetcode ?? ""}
      onChange={handleInputChange}
      className="edit-input"
      placeholder="https://leetcode.com/yourprofile"
    />

    <label className="edit-input-label" style={{ marginTop: 8 }}>Codeforces</label>
    <input
      name="socials.codeforces"
      value={editableData?.socials?.codeforces ?? ""}
      onChange={handleInputChange}
      className="edit-input"
      placeholder="https://codeforces.com/profile/yourprofile"
    />

    <label className="edit-input-label" style={{ marginTop: 8 }}>GitHub</label>
    <input
      name="socials.github"
      value={editableData?.socials?.github ?? ""}
      onChange={handleInputChange}
      className="edit-input"
      placeholder="https://github.com/yourprofile"
    />
  </div>
)}

      </aside>

      <main className="main-content">
        {/* Academic Performance */}
        <section className="card">
          <h2 className="section-title"><span className="section-icon">🎓</span>Academic Performance</h2>
          {isEditing ? (
            <div className="grid-2">
              <div><label className="edit-input-label">Current CGPA</label><input name="academics.cgpa" value={editableData?.academics?.cgpa ?? ""} onChange={handleInputChange} className="edit-input" type="number" step="0.1" /></div>
              <div><label className="edit-input-label">Backlogs</label><input name="academics.backlogs" value={editableData?.academics?.backlogs ?? ""} onChange={handleInputChange} className="edit-input" type="number" /></div>
              <div><label className="edit-input-label">10th Grade %</label><input name="academics.grade10" value={editableData?.academics?.grade10 ?? ""} onChange={handleInputChange} className="edit-input" /></div>
              <div><label className="edit-input-label">12th Grade %</label><input name="academics.grade12" value={editableData?.academics?.grade12 ?? ""} onChange={handleInputChange} className="edit-input" /></div>
            </div>
          ) : (
            <div className="grid-2">
              <div className="info-item"><div className="info-label">Current CGPA</div><div className="info-value cgpa-highlight">{displayData.academics.cgpa || 0} / 10.0</div></div>
              <div className="info-item"><div className="info-label">Backlogs</div><div className="info-value">{displayData.academics.backlogs ?? 0}</div></div>
              <div className="info-item"><div className="info-label">10th Grade</div><div className="info-value">{displayData.academics.grade10 || "-"}</div></div>
              <div className="info-item"><div className="info-label">12th Grade</div><div className="info-value">{displayData.academics.grade12 || "-"}</div></div>
            </div>
          )}
        </section>

       <section className="card">
  <div className="side-by-side-container">
    {/* Left: Skills */}
    <div className="left-panel">
      <h3 className="subsection-title">⚡ Skills</h3>
      {isEditing ? (
        <input
          type="text"
          placeholder="Enter comma-separated skills"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          onBlur={() => handleCommaInput("skills", "", skillsInput)}
          className="edit-input"
        />
      ) : (
        <div className="skills-container">
          {displayData.skills.length ? displayData.skills.map((s) => (
            <span key={s} className="skill-tag">{s}</span>
          )) : <div className="placeholder">No skills added</div>}
        </div>
      )}
    </div>

    {/* Right: Certifications */}
    <div className="right-panel">
      <h3 className="subsection-title">📜 Certifications</h3>
      {isEditing ? (
        <div>
          {(editableData?.certifications || []).map((cert, idx) => (
            <div key={idx} className="cert-edit-card">
              <input name="name" placeholder="Name" value={cert?.name ?? ""} onChange={(e) => handleCertificationChange(e, idx)} className="edit-input" />
              <input name="issuer" placeholder="Issuer" value={cert?.issuer ?? ""} onChange={(e) => handleCertificationChange(e, idx)} className="edit-input" />
              <input name="completed" placeholder="Year" value={cert?.completed ?? ""} onChange={(e) => handleCertificationChange(e, idx)} className="edit-input" />
              <button type="button" onClick={() => removeCertification(idx)} className="edit-btn cancel-btn">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addCertification} className="edit-btn save-btn">Add Certification</button>
        </div>
      ) : (
        <div className="certifications-container">
          {displayData.certifications.length ? displayData.certifications.map((cert, i) => (
            <div key={i} className="cert-card">
              <div className="cert-name">{cert.name || "-"}</div>
              <div className="cert-issuer">{cert.issuer || "-"} {cert.completed ? `• ${cert.completed}` : ""}</div>
            </div>
          )) : <div className="placeholder">No certifications added</div>}
        </div>
      )}
    </div>
  </div>
</section>


        {/* Career Preferences */}
        <section className="card">
          <h2 className="section-title"><span className="section-icon">🎯</span>Career Preferences</h2>
          {isEditing ? (
            <div>
<label className="edit-input-label" style={{ marginTop: 10 }}>Job Preference</label>
<div className="jobpref-list">
  {jobPreferences.map((pref) => (
  <div
    key={pref}
    className={`pref-chip ${
      editableData?.preferences?.jobTypes?.includes(pref) ? "selected" : ""
    }`}
    onClick={() => {
      setEditableData((prev) => {
        const prefs = new Set(prev.preferences?.jobTypes || []);
        if (prefs.has(pref)) prefs.delete(pref);
        else prefs.add(pref);
        return {
          ...prev,
          preferences: {
            ...(prev.preferences || {}),
            jobTypes: Array.from(prefs),
          },
        };
      });
    }}
  >
    {pref}
  </div>
))}

</div>
{/* <input type="text" value={(editableData?.preferences?.jobTypes || []).join(", ")} onChange={(e) => handleCommaInput("preferences", "jobTypes", e.target.value)} className="edit-input" /> */}
<label className="edit-input-label" style={{ marginTop: 10 }}>Preferred Locations</label>
<div className="location-list">
  {techCities.map((city) => (
    <div
      key={city}
      className={`location-chip ${
        editableData?.preferences?.locations?.includes(city) ? "selected" : ""
      }`}
      onClick={() => {
        setEditableData((prev) => {
          const locations = new Set(prev.preferences?.locations || []);
          if (locations.has(city)) locations.delete(city);
          else locations.add(city);
          return {
            ...prev,
            preferences: { ...(prev.preferences || {}), locations: Array.from(locations) },
          };
        });
      }}
    >
      {city}
    </div>
  ))}
  <div className="location-chip other-option">
    <input
      type="text"
      placeholder="Other city..."
      value={customCity}
      onChange={(e) => setCustomCity(e.target.value)}
      onBlur={() => {
        if (customCity.trim()) {
          setEditableData((prev) => ({
            ...prev,
            preferences: {
              ...(prev.preferences || {}),
              locations: [...(prev.preferences?.locations || []), customCity.trim()],
            },
          }));
          setCustomCity("");
        }
      }}
      className="other-input"
    />
  </div>
</div>
              <input type="text" value={(editableData?.preferences?.locations || []).join(", ")} onChange={(e) => handleCommaInput("preferences", "locations", e.target.value)} className="edit-input" />
              <label className="edit-input-label" style={{ marginTop: 10 }}>Industries of Interest</label>
<input type="text" 
   value={(editableData?.preferences?.industries || []).join(", ")} 
   onChange={(e) => handleCommaInput("preferences", "industries", e.target.value)} 
   className="edit-input" />

            </div>
          ) : (
            <div className="preferences-display" style={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
  <div>
    <strong>Job Preferences</strong>
    <div className="display-tags">
      {displayData.preferences?.jobTypes?.length
        ? displayData.preferences.jobTypes.map((pref, idx) => (
            <span key={idx} className="display-tag">{pref}</span>
          ))
        : <span className="display-tag">-</span>}
    </div>
  </div>

  <div>
    <strong>Preferred Locations</strong>
    <div className="display-tags">
      {displayData.preferences?.locations?.length
        ? displayData.preferences.locations.map((loc, idx) => (
            <span key={idx} className="display-tag">{loc}</span>
          ))
        : <span className="display-tag">-</span>}
    </div>
  </div>

  <div>
    <strong>Industries</strong>
    <div className="display-tags">
      {displayData.preferences?.industries?.length
        ? displayData.preferences.industries.map((ind, idx) => (
            <span key={idx} className="display-tag">{ind}</span>
          ))
        : <span className="display-tag">-</span>}
    </div>
  </div>
</div>


          )}
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
