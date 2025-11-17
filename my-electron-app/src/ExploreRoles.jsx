import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Link2, Calendar, ArrowLeft } from "lucide-react";
import "./ExploreRoles.css";
import { useNavigate } from "react-router-dom";

const coverImages = [
  "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?cs=srgb&dl=pexels-pixabay-269077.jpg&fm=jpg",
  "https://media.istockphoto.com/id/479842074/photo/empty-road-at-building-exterior.jpg?s=612x612&w=0&k=20&c=SbyfZGN0i2O_QPLCdBcu9vhuzbQvTz4bGEn-lIzrN0E=",
  "https://www.shutterstock.com/image-photo/munich-germany-april-10-2023-260nw-2291678869.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC7-RFA1xE4wTSP0DZJSJ1AJ8TitBYtkmEYA&s",
  "https://img.freepik.com/free-photo/modern-skyscrapers-japan-business-district_23-2148836796.jpg?semt=ais_hybrid&w=740&q=80",
  "https://img.freepik.com/free-photo/close-up-modern-office-buildings_1359-1038.jpg?semt=ais_hybrid&w=740&q=80",
  "https://images.pexels.com/photos/2783862/pexels-photo-2783862.jpeg?cs=srgb&dl=pexels-javon-swaby-197616-2783862.jpg&fm=jpg",
  "https://d1di04ifehjy6m.cloudfront.net/media/filer_public/f5/a4/f5a4841a-f587-430a-9df7-100f46408b51/how_bangalores_tech_parks_are_fueling_demand_for_high-end_residences.png",
  "https://us.123rf.com/450wm/alicephoto/alicephoto1602/alicephoto160200641/53497839-business-office-building-in-london-england.jpg?ver=6",
  "https://media.architecturaldigest.com/photos/63864739de5582d44f482a8f/16:9/w_2560%2Cc_limit/221012_Google_AD_MTV_MariposaCourtyard_0578.jpg",
  "https://cdn.tatlerasia.com/tatlerasia/i/2024/07/15172805-google-spruce-goose-3-photo-connie-zhou-at-conniezhounyc-instagram_cover_1600x1068.jpg",
  "https://images.squarespace-cdn.com/content/v1/5cf4be93e3947a0001fee134/1703048736761-A2I0MJDJY1DCLZXM6FJ6/07_DJI_0507c2.jpg",
  "https://www.janusetcie.com/wp-content/uploads/AmazonSpheresWA_07-1.jpg",
  "data:image/jpeg;base64,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",
  "https://static01.nyt.com/images/2020/08/25/business/25Amazon-India-01/merlin_175989213_eb0e728c-de14-4adf-8c0a-60c461c08a1f-mediumSquareAt3X.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFgV6tvNF9OGEmD7G5Avwi2ot5WtcNg9orhQ&s",
  "https://images.squarespace-cdn.com/content/v1/5cf4be93e3947a0001fee134/1703048739716-4TAJK93FXKD4F8BWXAB8/DJI_0839cte.jpg",
  "https://images.squarespace-cdn.com/content/v1/5cf4be93e3947a0001fee134/1703048736523-9S6TZYQ1IS503GTXZDZD/07_DJI_0507c.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0xv5aAwXxsRrBb0K93MXkc8vfrna7UXeBbg&s",
];

const ExploreRoles = () => {
    const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const fetchCompanies = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/companies");
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="explore-container">
        <button className="back-btn" onClick={() => navigate("/")} >
        <ArrowLeft size={18} />
        Back
      </button>
      <h1 className="title">Explore Open Roles</h1>
      <p className="subtitle">Browse internships and job openings available for you</p>

      <div className="roles-grid">
        {companies.map((c, i) => {
          const cover = coverImages[i % coverImages.length];
          return (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="role-card"
            >
              <div className="role-cover">
                <img src={cover} alt="cover" className="role-img" />
                <div className="role-overlay">
                  <h2>{c.name}</h2>
                  <h3>{c.role}</h3>
                  {c.location && (
                    <p className="loc">
                      <MapPin size={14} /> {c.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="role-body">
                {c.ctc && <p><strong>CTC:</strong> {c.ctc}</p>}
                {c.criteria && <p><strong>Eligibility:</strong> {c.criteria}</p>}
                {c.lastDate && (
                  <p className="last-date">
                    <Calendar size={14} />
                    Last date: {c.lastDate}
                  </p>
                )}
                {c.description && <p className="desc">{c.description}</p>}

                {c.applyLink && (
                  <a
                    href={c.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="apply-btn"
                  >
                    <Link2 size={15} /> Apply Now
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ExploreRoles;
