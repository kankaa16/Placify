import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./PlacementAnalytics.css";

const API_BASE = "http://localhost:5000/api/analytics";

const PlacementAnalytics = () => {
  const [mode, setMode] = useState("field");
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [analyticsData, setAnalyticsData] = useState([]);
  const [companyDetail, setCompanyDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const detailRef = useRef(null);
  const fetchTokenRef = useRef(0);

  const sanitizeValue = (v) => {
    if (v === "Infinity" || v === "-Infinity" || v === null || isNaN(v))
      return null;
    return Number(v).toFixed(2);
  };

  // Fetch dropdown options (runs only once)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (mode === "field") {
          setOptions([
  "machine learning",
  "web development",
  "data science",
  "cyber security",
  "cloud computing",
  "block chain",
  "devops",
  "ui/ux design",
]);
        } else {
          const res = await axios.get(`${API_BASE}/companies`);
          setOptions(res.data.companies || []);
        }
      } catch (err) {
        console.error("⚠️ Error fetching options:", err);
        setOptions([]);
      }
    };
    fetchOptions();
  }, [mode]);

  // Fetch analytics by field
  const fetchAnalyticsByField = async (fieldName, token) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/get/${encodeURIComponent(fieldName)}`);
      if (token !== fetchTokenRef.current) return;
      const cleanData = (res.data.analytics || []).map((item) => ({
        ...item,
        avgPackage: sanitizeValue(item.avgPackage),
        minPackage: sanitizeValue(item.minPackage),
        maxPackage: sanitizeValue(item.maxPackage),
      }));
      setAnalyticsData(cleanData);
      setCompanyDetail(null);
    } catch (err) {
      console.error("⚠️ Error fetching field analytics:", err);
      if (token === fetchTokenRef.current) setAnalyticsData([]);
    } finally {
      if (token === fetchTokenRef.current) setLoading(false);
    }
  };

  // Fetch analytics by company (for detail)
  const fetchAnalyticsByCompany = async (companyName, token) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/company/${encodeURIComponent(companyName)}`
      );
      if (token !== fetchTokenRef.current) return;

      const c = res.data.company || {};
      setCompanyDetail({
        ...c,
        avgPackage: sanitizeValue(c.avgPackage),
        minPackage: sanitizeValue(c.minPackage),
        maxPackage: sanitizeValue(c.maxPackage),
      });

      setAnalyticsData([
        {
          companyName: c.companyName,
          roles: c.roles,
          avgPackage: sanitizeValue(c.avgPackage),
          minPackage: sanitizeValue(c.minPackage),
          maxPackage: sanitizeValue(c.maxPackage),
          totalHires: c.totalHires,
          website: c.website,
        },
      ]);
    } catch (err) {
      console.error("⚠️ Error fetching company analytics:", err);
      if (token === fetchTokenRef.current) setAnalyticsData([]);
    } finally {
      if (token === fetchTokenRef.current) setLoading(false);
    }
  };

  // Watch for selected option change
  useEffect(() => {
    if (!selectedOption) return;
    const token = ++fetchTokenRef.current;
    if (mode === "field") fetchAnalyticsByField(selectedOption, token);
    else fetchAnalyticsByCompany(selectedOption, token);
  }, [selectedOption]);

  // Auto-scroll to detail
  useEffect(() => {
    if (companyDetail && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [companyDetail]);

  const handleRowClick = async (companyName) => {
    const token = ++fetchTokenRef.current;
    await fetchAnalyticsByCompany(companyName, token);
  };

  return (
    <div className="analytics-container">
      <div className="close-container">
        <motion.button
          whileHover={{ rotate: 45, scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="close-btn"
          onClick={() => navigate("/student-dashboard")}
        >
          ×
        </motion.button>
      </div>

      <h2>📊 Placement Analytics Dashboard</h2>

      <div className="controls-row">
        <div className="search-mode">
          <label>Search By:</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="field">Field</option>
            <option value="company">Company</option>
          </select>
        </div>

        <div className="option-selector">
          <label>
            {mode === "field" ? "Select Field:" : "Select Company:"}
          </label>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            <option value="">-- Select --</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="loading">Fetching placement insights...</p>
      ) : (
        <>
          <div className="analytics-table">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Roles</th>
                  <th>Min (LPA)</th>
                  <th>Avg (LPA)</th>
                  <th>Max (LPA)</th>
                  <th>Total Hires</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.length === 0 ? (
                  <tr>
                    <td colSpan="6">No data found</td>
                  </tr>
                ) : (
                  analyticsData.map((record, index) => (
                    <tr
                      key={index}
                      onClick={() => handleRowClick(record.companyName)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        {record.website ? (
                          <a
                            href={record.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {record.companyName}
                          </a>
                        ) : (
                          record.companyName
                        )}
                      </td>
                      <td>
                        {record.roles && record.roles.length
                          ? record.roles.join(", ")
                          : "—"}
                      </td>
                      <td>{record.minPackage ?? "N/A"}</td>
                      <td>{record.avgPackage ?? "N/A"}</td>
                      <td>{record.maxPackage ?? "N/A"}</td>
                      <td>{record.totalHires ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {companyDetail && (
            <motion.div
              ref={detailRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="company-detail"
            >
              <h3 className="detail-title">{companyDetail.companyName}</h3>

              <p>
                <strong>🌐 Website:</strong>{" "}
                {companyDetail.website ? (
                  <a
                    href={companyDetail.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {companyDetail.website}
                  </a>
                ) : (
                  "—"
                )}
              </p>

              <p>
                <strong>💼 Roles:</strong>{" "}
                {companyDetail.roles?.join(", ") || "N/A"}
              </p>

              <div className="salary-info">
                <strong>💰 Packages:</strong>
                <ul>
                  <li>
                    <b>Min:</b> {companyDetail.minPackage || "N/A"} LPA
                  </li>
                  <li>
                    <b>Avg:</b> {companyDetail.avgPackage || "N/A"} LPA
                  </li>
                  <li>
                    <b>Max:</b> {companyDetail.maxPackage || "N/A"} LPA
                  </li>
                </ul>
              </div>

              <div className="skills-section">
                <strong>🧠 Required Skills:</strong>
                {companyDetail.requirements?.length ? (
                  <div className="skills-list">
                    {companyDetail.requirements.map((skill, idx) => (
                      <span key={idx} className="skill-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No skill data available</p>
                )}
              </div>

              <div className="chart-section">
                <h4>📊 Year-wise Hiring Trends</h4>
                {companyDetail.yearWise && companyDetail.yearWise.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={companyDetail.yearWise}>
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hires" fill="#9f70fd" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No year-wise data available</p>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default PlacementAnalytics;