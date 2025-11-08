import React, { useEffect, useState } from "react";
import { Check, X, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const AdminOfferVerification = () => {
  const [offers, setOffers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchOffers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/applications/offer_uploaded", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOffers(data);
    } catch {
      toast.error("Failed to fetch offers");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const verifyOffer = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${id}/verify-offer`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(action === "approve" ? "Offer verified" : "Offer rejected");
        fetchOffers();
      } else toast.error("Failed to update");
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="admin-wrapper">
      <h2 className="page-title">Offer Verification</h2>

      <div className="table-container">
        <div className="table-header">
          <span>Student</span>
          <span>Company</span>
          <span>Offered Role</span>
          <span>CTC</span>
          <span>Action</span>
        </div>

        {offers.map((offer) => (
          <motion.div
            key={offer._id}
            className="table-row"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>{offer.student?.fName} {offer.student?.lName}</span>
            <span>{offer.company?.name}</span>
            <span>{offer.offeredRole}</span>
            <span>{offer.offeredCTC} LPA</span>

            <div className="row-actions">
              {offer.offerLetterUrl && (
                <a
                  href={offer.offerLetterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="view-btn"
                >
                  <ExternalLink size={16} />
                </a>
              )}
              <button
                className="approve-btn"
                onClick={() => verifyOffer(offer._id, "approve")}
              >
                <Check size={18} />
              </button>
              <button
                className="reject-btn"
                onClick={() => verifyOffer(offer._id, "reject")}
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminOfferVerification;
