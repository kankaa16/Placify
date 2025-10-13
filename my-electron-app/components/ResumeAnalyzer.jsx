import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import "./ResumeAnalyzer.css";

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a PDF resume first!");
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/resume/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing resume");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: result?.skills || [],
    datasets: [
      {
        label: "Skill presence",
        data: result?.skills?.map(() => 1) || [],
        backgroundColor: "rgba(0, 255, 200, 0.7)"
      }
    ]
  };

  return (
    <div className="resume-analyzer">
      <h2>AI Resume Analyzer</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {result && (
        <div className="result">
          <h3>Analysis Result</h3>
          <p><strong>Name:</strong> {result.name}</p>
          <p><strong>Email:</strong> {result.email}</p>
          <p><strong>Phone:</strong> {result.phone}</p>
          <p><strong>Score:</strong> {result.score}%</p>

          <div className="skills-chart">
            <Bar
              data={chartData}
              options={{
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                responsive: true
              }}
            />
          </div>

          <div className="suggestions">
            <h4>Suggestions</h4>
            <ul>{result.suggestions?.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
