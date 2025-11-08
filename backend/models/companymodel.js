import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  ctc: { type: String, required: true },
  criteria: { type: String, required: true },
  location: { type: String, default: "Not specified" },
  description: { type: String },
  lastDate: { type: String },
  applyLink: { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Company", companySchema);
