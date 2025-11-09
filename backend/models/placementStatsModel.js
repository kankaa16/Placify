import mongoose from "mongoose";

const placementStatsSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true },
    offeredRole: { type: String, required: true },
    offeredCTC: { type: Number, required: true },
    verifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("PlacementStat", placementStatsSchema);
