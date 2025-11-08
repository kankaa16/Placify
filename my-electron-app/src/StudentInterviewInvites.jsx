import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const StudentInterviewInvites = () => {
  const [invites, setInvites] = useState([]);
  const token = localStorage.getItem("token");

  const fetchInvites = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/applications/interview_invited", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInvites(data);
    } catch {
      toast.error("Failed to fetch invites");
    }
  };

  const acceptInvite = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${id}/accept-invite`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Invite accepted");
        fetchInvites();
      } else toast.error("Could not accept invite");
    } catch {
      toast.error("Server error");
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  return (
    <div className="student-wrapper">
      <h2 className="page-title">Interview Invites</h2>

      <div className="table-container">
        <div className="table-header">
          <span>Company</span>
          <span>Role</span>
          <span>Action</span>
        </div>

        {invites.map((invite) => (
          <motion.div
            key={invite._id}
            className="table-row"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>{invite.company?.name}</span>
            <span>{invite.company?.role}</span>
            <button className="approve-btn" onClick={() => acceptInvite(invite._id)}>
              <CheckCircle size={18} /> Accept
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentInterviewInvites;
