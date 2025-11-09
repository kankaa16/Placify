import React, { useState, useEffect } from "react";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./StudentOfferUpload.css";

function StudentOfferUpload() {
  const [form, setForm] = useState({
    companyName: "",
    offeredRole: "",
    offeredCTC: "",
    offerNote: "",
  });
  const [file, setFile] = useState(null);
  const [applicationId, setApplicationId] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // auto-fetch the student's application
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/applications/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setApplicationId(data[0]._id);
        }
      } catch {
        toast.error("Could not fetch your application");
      }
    };
    fetchApp();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !form.companyName || !form.offeredRole || !form.offeredCTC) {
      toast.error("Please fill all fields and attach your offer letter.");
      return;
    }

    const formData = new FormData();
    formData.append("companyName", form.companyName);
    formData.append("offeredRole", form.offeredRole);
    formData.append("offeredCTC", form.offeredCTC);
    formData.append("offerNote", form.offerNote);
    formData.append("offerLetter", file);

    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/upload-offer`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Offer uploaded successfully");
        setForm({
          companyName: "",
          offeredRole: "",
          offeredCTC: "",
          offerNote: "",
        });
        setFile(null);
        navigate("/student-dashboard");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="offer-page">
      <div className="offer-card">
        <div className="offer-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <h2>Upload Offer Letter</h2>
          <p className="subtitle">
            Submit your placement offer for verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="offer-form">
          <div className="form-grid">
            <input
              type="text"
              placeholder="Company Name"
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Offered Role"
              value={form.offeredRole}
              onChange={(e) =>
                setForm({ ...form, offeredRole: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="CTC (in LPA)"
              value={form.offeredCTC}
              onChange={(e) =>
                setForm({ ...form, offeredCTC: e.target.value })
              }
              required
            />
          </div>

          <textarea
            placeholder="Additional notes or comments (optional)"
            value={form.offerNote}
            onChange={(e) => setForm({ ...form, offerNote: e.target.value })}
          />

          <div className="file-upload-box">
            <label htmlFor="offerFile" className="upload-label">
              <UploadCloud size={20} />
              <span>{file ? file.name : "Select Offer Letter (PDF/Image)"}</span>
            </label>
            <input
              id="offerFile"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <button type="submit" className="submit-btn">
            Upload Offer
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentOfferUpload;
