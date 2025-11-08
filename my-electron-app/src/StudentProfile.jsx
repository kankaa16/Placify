import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftCircle } from "lucide-react";
import "./StudentProfile.css";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/students/${id}`);
        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error("Failed to fetch student:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!student) return <div className="error">Student not found.</div>;

  return (
    <motion.div
      className="student-profile-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="profile-header">
        <h2>{student.fName} {student.lName}</h2>
        <button className="back-btn" onClick={() => navigate("/student-management")}>
          Back <ArrowLeftCircle size={18} />
        </button>
      </div>

      <div className="profile-card">
        <p className="email">{student.emailID}</p>

        <div className="profile-section">
          <h3>Academic Details</h3>
          <p><strong>Department:</strong> {student.dept || "N/A"}</p>
          <p><strong>CGPA:</strong> {student.academics?.cgpa || "N/A"}</p>
          <p><strong>Backlogs:</strong> {student.academics?.backlogs || "N/A"}</p>
        </div>

        <div className="profile-section">
          <h3>Contact</h3>
          <p><strong>Phone:</strong> {student.contact?.phone || "N/A"}</p>
          <p><strong>Location:</strong> {student.contact?.location || "N/A"}</p>
        </div>

        <div className="profile-section">
          <h3>Skills</h3>
          <p>{student.skills?.length ? student.skills.join(", ") : "No skills added"}</p>
        </div>

        <div className="profile-section">
          <h3>Certifications</h3>
          {student.certifications?.length ? (
            <ul>
              {student.certifications.map((c, i) => (
                <li key={i}>{c.name} – {c.issuer}</li>
              ))}
            </ul>
          ) : (
            <p>No certifications listed</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfile;
