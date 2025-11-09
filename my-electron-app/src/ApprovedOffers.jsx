import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Briefcase, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ApprovedOffers.css";

const ApprovedOffers = () => {
  const [offers, setOffers] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchOffers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/placements/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setOffers(data);
    } catch {
      console.error("Failed to fetch approved offers");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="approved-offers-page">
      <header className="approved-header">
        <button className="back-btn" onClick={() => navigate("/admin-dashboard")}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>Approved Offers</h2>
        <p>All final verified placement records</p>
      </header>

      {offers.length === 0 ? (
        <div className="no-records">No approved offers yet</div>
      ) : (
        <div className="offers-grid">
          {offers.map((offer, i) => (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="offer-card"
            >
              <div className="offer-top">
                <h3><Building2 size={16} /> {offer.companyName}</h3>
                <p><Briefcase size={14} /> {offer.offeredRole}</p>
              </div>
              <div className="offer-meta">
                <p><User size={14} /> {offer.student?.fName} {offer.student?.lName}</p>
                <p><strong>CTC:</strong> ₹{offer.offeredCTC} LPA</p>
                <p><strong>Verified:</strong> {new Date(offer.verifiedAt).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovedOffers;
