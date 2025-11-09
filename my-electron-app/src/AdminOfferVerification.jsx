import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Eye, ArrowLeft, ExternalLink, Download } from "lucide-react";
import toast from "react-hot-toast";
import "./AdminOfferVerification.css";
import { useNavigate } from "react-router-dom";

function AdminOfferVerification() {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchOffers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/applications/offers/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setOffers(data);
      else toast.error(data.error || "Failed to load offers");
    } catch {
      toast.error("Server error while fetching offers");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${id}/verify-offer`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Offer ${action}d successfully`);
        setOffers((prev) => prev.filter((o) => o._id !== id));
        setSelectedOffer(null);
      } else toast.error(data.error || "Failed to update offer");
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="offer-verify-container">
      <div className="offer-verify-header">
        <button className="back-btn" onClick={() => navigate("/admin-dashboard")}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2>Pending Offer Letters</h2>
      </div>

      <div className="offer-list">
        {offers.length === 0 ? (
          <div className="empty">No pending offers yet</div>
        ) : (
          offers.map((offer, i) => (
            <motion.div
              key={offer._id}
              className="offer-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="offer-header">
                <h4>
                  {offer.student?.fName} {offer.student?.lName}
                </h4>
                <span>{offer.companyName || "Unknown Company"}</span>
              </div>
              <p>
                <strong>Role:</strong> {offer.offeredRole}
              </p>
              <p>
                <strong>CTC:</strong> {offer.offeredCTC} LPA
              </p>
              {offer.offerNote && (
                <p>
                  <strong>Note:</strong> {offer.offerNote}
                </p>
              )}

              <div className="offer-actions">
                <button className="view-btn" onClick={() => setSelectedOffer(offer)}>
                  <Eye size={18} /> View Proof
                </button>
                <button className="approve-btn" onClick={() => handleAction(offer._id, "approve")}>
                  <CheckCircle size={18} /> Approve
                </button>
                <button className="reject-btn" onClick={() => handleAction(offer._id, "reject")}>
                  <XCircle size={18} /> Reject
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {selectedOffer && (
        <div className="proof-modal" onClick={() => setSelectedOffer(null)}>
          <div className="proof-content" onClick={(e) => e.stopPropagation()}>
            <h3>Offer Proof</h3>

            {(() => {
              const url = selectedOffer.offerLetterUrl;
              if (!url) return <p>No file uploaded</p>;

              const isPdf = url.toLowerCase().endsWith(".pdf");

              return (
                <>
                  {isPdf ? (
                    <div className="pdf-display">
                      <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                        PDF file uploaded. You can open or download it below:
                      </p>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="open-link"
                      >
                        <ExternalLink size={16} /> View PDF in New Tab
                      </a>
                      <a
                        href={url}
                        download={`OfferLetter_${selectedOffer.student?.fName || "student"}.pdf`}
                        className="download-link"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          marginTop: "10px",
                        }}
                      >
                        <Download size={16} /> Download PDF
                      </a>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt="Offer Proof"
                      className="proof-image"
                    />
                  )}
                </>
              );
            })()}

            <button className="close-modal" onClick={() => setSelectedOffer(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOfferVerification;
