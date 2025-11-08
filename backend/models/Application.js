import mongoose from "mongoose";


const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: false },
    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "interview_invited",
        "interview_accepted",
        "offer_uploaded",
        "final_verified",
        "rejected"
      ],
      default: "applied"
    },
    offeredRole: String,
    offeredCTC: String,
    offerLetterUrl: String,
    offerNote: String,
    uploadedAt: Date,
    verifiedAt: Date
  },
  { timestamps: true }
);
export default mongoose.model("Application", applicationSchema);


