import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";

const StudentOfferUpload = () => {
  const [apps, setApps] = useState([]);
  const [form, setForm] = useState({});
  const [open, setOpen] = useState(null);
  const token = localStorage.getItem("token");

  const loadApps = async () => {
    const res = await fetch("http://localhost:5000/api/applications/interview_accepted", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setApps(data);
  };

  const uploadOffer = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${id}/upload-offer`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Offer uploaded");
        setOpen(null);
        loadApps();
      } else toast.error("Upload failed");
    } catch {
      toast.error("Server error");
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  return (
    <div className="student-wrapper">
      <h2 className="page-title">Upload Offer Letter</h2>

      <div className="table-container">
        <div className="table-header">
          <span>Company</span>
          <span>Role</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {apps.map((a) => (
          <motion.div key={a._id} className="table-row">
            <span>{a.company?.name}</span>
            <span>{a.company?.role}</span>
            <span>{a.status}</span>
            <button
              className="approve-btn"
              onClick={() => {
                setOpen(a._id);
                setForm({});
              }}
            >
              <Upload size={18} /> Upload Offer
            </button>
          </motion.div>
        ))}
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Offer Details</h3>
            <input
              placeholder="Offered Role"
              onChange={(e) => setForm({ ...form, offeredRole: e.target.value })}
            />
            <input
              placeholder="CTC (INR)"
              onChange={(e) => setForm({ ...form, offeredCTC: e.target.value })}
            />
            <input
              placeholder="Offer Letter URL"
              onChange={(e) => setForm({ ...form, offerLetterUrl: e.target.value })}
            />
            <textarea
              placeholder="Any note for admin"
              onChange={(e) => setForm({ ...form, offerNote: e.target.value })}
            />
            <div className="btn-group">
              <button className="cancel-btn" onClick={() => setOpen(null)}>Cancel</button>
              <button className="submit-btn" onClick={() => uploadOffer(open)}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOfferUpload;
