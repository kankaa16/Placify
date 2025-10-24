import mongoose from "mongoose";
const hiringRecordSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,  // link to a company
    ref: "Company",                       // reference model name
    required: true,
  },
  year: {
    type: Number,                         // e.g. 2021, 2022, 2023
    required: true,
  },
  role: {
    type: String,                         // e.g. "ML Engineer", "SDE"
    required: true,
    trim: true,
  },
  hires: {
    type: Number,                         // how many people hired
    required: true,
  },
  avgPackage: {
    type: Number,                         // average package offered (in LPA)
    required: true,
  },
  minPackage: {
    type: Number,                         // lowest package offered
  },
  maxPackage: {
    type: Number,                         // highest package offered
  },
});

const HiringRecord = mongoose.model("HiringRecord", hiringRecordSchema);
export default HiringRecord;
