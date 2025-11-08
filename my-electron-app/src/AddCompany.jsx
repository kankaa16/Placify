import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle, Building2, Upload } from "lucide-react";
import "./AddCompany.css";

const AddCompany = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    role: "",
    ctc: "",
    criteria: "",
    location: "",
    description: "",
    lastDate: "",
    applyLink: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/companies/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, addedBy: user?._id }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Company added successfully!");
        setTimeout(() => navigate("/admin-dashboard"), 1200);
      } else toast.error(data.error || "Failed to add company");
    } catch (err) {
      toast.error("Server error, try again later");
      console.error(err);
    }
  };

  return (
    <div className="addcompany-wrapper">
      <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="addcompany-panel"
>
  {/* move the back button OUTSIDE the header */}
  <button className="back-btn" onClick={() => navigate("/admin-dashboard")}>
    ✕
  </button>

  <div className="addcompany-header">
    <h2 className="addcompany-title">
      <Building2 className="icon" /> Add Company
    </h2>
  </div>

        <form className="parent" onSubmit={handleSubmit}>
          <div className="div1 grid-field">
            <label>Company Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Eg. Google"
            />
          </div>

          <div className="div2 grid-field">
            <label>Role</label>
            <input
              type="text"
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Eg. Software Engineer"
            />
          </div>

          <div className="div3 grid-field">
            <label>CTC</label>
            <input
              type="text"
              name="ctc"
              value={form.ctc}
              onChange={handleChange}
              placeholder="Eg. 20 LPA"
            />
          </div>

          <div className="div4 grid-field">
            <label>Criteria</label>
            <input
              type="text"
              name="criteria"
              value={form.criteria}
              onChange={handleChange}
              placeholder="Eg. 8 CGPA"
            />
          </div>

          <div className="div5 grid-field">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief company or role details..."
              rows="3"
            />
          </div>

          <div className="div6 grid-field">
            <label>Last Date</label>
            <input
              type="date"
              name="lastDate"
              value={form.lastDate}
              onChange={handleChange}
            />
          </div>

          <div className="div7 grid-field">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Eg. Bangalore / Remote"
            />
          </div>

          <div className="div8 grid-field">
            <label>Apply Link</label>
            <input
              type="text"
              name="applyLink"
              value={form.applyLink}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="submit-btn"
          >
            <Upload size={18} /> Submit
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddCompany;
