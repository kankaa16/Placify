import React, { useState, useRef, useEffect } from "react";
import "./Resume.css";

function ATSCircle({ percent }) {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progressOffset = circumference - (percent / 100) * circumference;
    setTimeout(() => setOffset(progressOffset), 200); // animate after render
  }, [circumference, percent]);

  return (
    <svg height={radius * 2} width={radius * 2} style={{ transform: "rotate(-90deg)" }}>
      <circle
        stroke="#444"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#FFD700"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + " " + circumference}
        strokeDashoffset={offset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="20px"
        fill="#fff"
        style={{ transform: "rotate(90deg)" }}
      >
        {percent}%
      </text>
    </svg>
  );
}

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [collapsed, setCollapsed] = useState({
    missing: false,
    thoughts: false,
    raw: true
  });
  const fileRef = useRef(null);

  const handleFile = (e) => setFile(e.target.files?.[0] || null);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Upload a resume file");

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_description", jobDesc || "");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/resume/upload", {
        method: "POST",
        headers: {
    Authorization: `Bearer ${token}`
  },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data.analysis || String(data));
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setJobDesc("");
    setResult(null);
    fileRef.current.value = null;
  };

  const toggle = (key) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  const parseSections = (text) => {
    const safe = text ? String(text) : "";

    const mp = safe.match(/Match Percentage[:\s]*([0-9]{1,3})\s*%/i);
    const percentMatch = mp ? Math.min(100, Math.max(0, parseInt(mp[1], 10))) : 0;
    const matchText = mp ? `${percentMatch}%` : "0%";

    const mk = safe.match(/\*\*Missing Keywords:\*\*([\s\S]*?)(?=\*\*|$)/i);
    const ft = safe.match(/\*\*Final Thoughts:\*\*([\s\S]*?)(?=\*\*|$)/i);
    const ms = safe.match(/\*\*Missing Skills:\*\*([\s\S]*?)(?=\*\*Recommendations:\*\*|$)/i);
    const rec = safe.match(/\*\*Recommendations:\*\*([\s\S]*?)$/i);

    const missingText = mk ? mk[1].trim() : "";
    const thoughtsText = ft ? ft[1].trim() : "";

    const rawAnalysis = `
${ms ? `**Missing Skills:**\n${ms[1].trim()}` : "**Missing Skills:**\nNone"}
${rec ? `**Recommendations:**\n${rec[1].trim()}` : ""}
`;

    return { matchText, missingText, thoughtsText, percentMatch, raw: rawAnalysis };
  };

  const extractKeywords = (missingText) => {
    if (!missingText) return [];
    let cleaned = missingText.replace(/\d+\.\s*/g, ", ").replace(/\(.*?\)/g, "");
    const parts = cleaned.split(/[,;\n\/]+/);
    return parts.map(s => s.trim()).filter(s => s.length > 1).slice(0, 60);
  };

  const sections = parseSections(result);
  const missingTags = extractKeywords(sections.missingText);

  const prettyFileInfo = file ? `${file.name} · ${Math.round(file.size / 1024)} KB` : "no file chosen";

  return (
    <div className="ra-wrap dark-theme">
      <header className="ra-header">
        <h1 className="ra-title">Resume Analyzer</h1>
        <p className="ra-sub">Upload a resume and get actionable feedback</p>
         <button className="back-btn" onClick={() => window.history.back()}>
    ✕
  </button>
      </header>

      <main className="ra-main">
        <section className="ra-left">
          <form className="ra-form" onSubmit={submit}>
            <label className="field-label">Job Description (optional)</label>
            <textarea
              className="field-textarea small-box"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste job description here..."
              rows={3}
            />

            <label className="field-label">Resume File</label>
            <div className="file-row">
              <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={handleFile} className="file-input" />
              <div className="file-info">{prettyFileInfo}</div>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn primary">
                {loading ? "Analyzing..." : "Analyze Resume"}
              </button>
              <button type="button" onClick={reset} className="btn ghost">Reset</button>
            </div>

            {result && (
              <div className="ats-card">
                <ATSCircle percent={sections.percentMatch} />
                <p className="ats-text"> ATS SCORE - {sections.matchText}</p>
              </div>
            )}
          </form>
        </section>

        <section className="ra-right">
          {!result && (
            <div className="placeholder-card">
              <div className="placeholder-text">Your analysis will appear here</div>
            </div>
          )}

          {result && (
            <div className="results-grid">
              <div className="card" style={{ marginTop: "30px" }}>
                <div className="card-head">
                  <h3>Missing Keywords</h3>
                  <button className="collapse-btn" onClick={() => toggle("missing")}>
                    {collapsed.missing ? "Open" : "Collapse"}
                  </button>
                </div>
                <div className={`card-body ${collapsed.missing ? "collapsed" : ""}`}>
                  {missingTags.length ? (
                    <div className="tags-wrap">
                      {missingTags.map((t, i) => (
                        <span key={i} className="keyword-badge">{t}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="small-note">No missing keywords found</div>
                  )}
                </div>
              </div>

              <div className="card" style={{ marginTop: "35px" }}>
                <div className="card-head">
                  <h3>Final Thoughts</h3>
                  <button className="collapse-btn" onClick={() => toggle("thoughts")}>
                    {collapsed.thoughts ? "Open" : "Collapse"}
                  </button>
                </div>
                <div className={`card-body ${collapsed.thoughts ? "collapsed" : ""}`}>
                  <pre>{sections.thoughtsText}</pre>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Full-width Raw Analysis Card */}
      {result && (
  <div className="card">
    <div className="card-head">
      <h3>Raw Analysis</h3>
      <button className="collapse-btn" onClick={() => toggle("raw")}>
        {collapsed.raw ? "Open" : "Collapse"}
      </button>
    </div>
    <div className={`card-body ${collapsed.raw ? "collapsed" : ""}`} style={{ lineHeight: "1.6", marginTop: "10px", fontSize: "16px" }}>
  {sections.raw.split("\n").map((line, idx) => {
    const cleaned = line.replace(/\*\*|`|→|◦/g, "").trim(); // removes stars, backticks, arrows, bullets
    if (cleaned.toLowerCase().includes("missing skills:") || cleaned.toLowerCase().includes("recommendations:")) {
      return (
        <div
          key={idx}
          style={{
            fontWeight: "bold",
            fontSize: "18px",
            marginTop: "10px",
          }}
        >
          {cleaned}
        </div>
      );
    } else {
      return (
        <div
          key={idx}
          style={{
            marginLeft: "10px",
            marginTop: "5px",
            fontSize: "16px", // bigger than before
          }}
        >
          {cleaned}
        </div>
      );
    }
  })}
</div>

  </div>

      )}

      <footer className="ra-footer">
        <small>Powered by your local server</small>
      </footer>
    </div>
  );
}
