import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, CheckCircle, XCircle, Trash2, Search, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./AdminStudentList.css";

const AdminStudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    studentId: "",
    companyName: "",
    role: "",
    date: "",
    time: "",
    link: "",
  });

  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/students/all");
      const data = await res.json();
      setStudents(data);
    } catch {
      toast.error("Failed to load students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) return fetchStudents();

    const res = await fetch(`http://localhost:5000/api/students/search?query=${encodeURIComponent(term)}`);
    const data = await res.json();
    if (res.ok) setStudents(data);
  };

  const handleShortlist = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/by-student/${id}/mark-shortlisted`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) toast.success("Student shortlisted for next round");
      else toast.error(data.error || "Shortlisting failed");
    } catch {
      toast.error("Server error");
    }
  };

  // ✅ open modal
  const openInviteModal = (id) => {
    setInviteData({
      studentId: id,
      companyName: "",
      role: "",
      date: "",
      time: "",
      link: "",
    });
    setShowInviteModal(true);
  };

  // ✅ send invite
  const sendInterviewInvite = async () => {
    const { studentId, companyName, role, date, time, link } = inviteData;
    if (!companyName || !role || !date || !time) {
      toast.error("Please fill all fields");
      return;
    }

    const interviewDate = new Date(`${date}T${time}`);
    try {
      const res = await fetch(`http://localhost:5000/api/applications/by-student/${studentId}/send-invite`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ interviewDate, interviewLink: link, companyName, role }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Interview invite sent successfully");
        setShowInviteModal(false);
        setInviteData({ studentId: "", companyName: "", role: "", date: "", time: "", link: "" });
      } else toast.error(data.error || "Failed to send invite");
    } catch {
      toast.error("Server error");
    }
  };

  const handleDecision = async (id, decision) => {
    try {
      const res = await fetch(`http://localhost:5000/api/students/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) toast.success(`Student ${decision}`);
      else toast.error("Failed to process");
    } catch {
      toast.error("Error sending decision");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Student deleted");
        setStudents((prev) => prev.filter((s) => s._id !== id));
      } else toast.error("Failed to delete student");
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <motion.div className="student-dashboard-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="dashboard-title">Student Performance Dashboard</h2>

      <div className="dashboard-header">
        <div className="right-section">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search by name, dept..." />
          </div>
          <button className="back-btn" onClick={() => navigate("/admin-dashboard")}>✕</button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span>Name</span>
          <span>Department</span>
          <span>Readiness</span>
          <span>Actions</span>
        </div>

        {students.map((s, i) => (
          <motion.div
            key={s._id}
            className="table-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <span>{s.fName} {s.lName}</span>
            <span>{s.dept || "N/A"}</span>
            <span>{s.readinessScore ?? "—"}</span>
            <div className="row-actions">
              <button className="action-btn view" onClick={() => navigate(`/student/${s._id}`)}><Eye size={20} /></button>
              <button className="action-btn approve" onClick={() => handleShortlist(s._id)} title="Shortlist"><CheckCircle size={20} /></button>
              <button className="action-btn invite" onClick={() => openInviteModal(s._id)} title="Send Interview Invite"><Calendar size={20} /></button>
              <button className="action-btn reject" onClick={() => handleDecision(s._id, "rejected")}><XCircle size={20} /></button>
              <button className="action-btn delete" onClick={() => handleDelete(s._id)}><Trash2 size={20} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ✅ Interview Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Send Interview Invite</h3>
            <input type="text" placeholder="Company Name" value={inviteData.companyName} onChange={(e) => setInviteData({ ...inviteData, companyName: e.target.value })} />
            <input type="text" placeholder="Role" value={inviteData.role} onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })} />
            <input type="date" value={inviteData.date} onChange={(e) => setInviteData({ ...inviteData, date: e.target.value })} />
            <input type="time" value={inviteData.time} onChange={(e) => setInviteData({ ...inviteData, time: e.target.value })} />
            <input type="text" placeholder="Meeting Link (optional)" value={inviteData.link} onChange={(e) => setInviteData({ ...inviteData, link: e.target.value })} />

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowInviteModal(false)}>Cancel</button>
              <button className="send-btn" onClick={sendInterviewInvite}>Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminStudentList;
