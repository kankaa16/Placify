import React, { useState } from "react";
import axios from "axios";
import './resume.css';
import ResumeResult from "./ResumeResult.jsx";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("fullstack");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role); 

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-upload-container">
       <button className="close-btn" onClick={() => window.history.back()}>
    &times;
  </button>

      <h1>Resume Analyzer</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Branch / Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="fullstack">Full Stack</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="datascience">Data Analyst / Data Scientist</option>
            <option value="ai">AI / Machine Learning</option>
            <option value="it">IT / Software</option>
            <option value="cs">Computer Science</option>
            <option value="ee">Electrical Engineering</option>
            <option value="ece">Electronics & Communication</option>
            <option value="devops">DevOps</option>
            <option value="mobile">Mobile / Android / iOS</option>
          </select>
        </div>

        <div>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>

      {result && <ResumeResult result={result} />}
    </div>
  );
};

export default ResumeUpload;
