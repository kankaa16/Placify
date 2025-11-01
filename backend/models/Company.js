import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,   // must be filled
    unique: true,     // no duplicate companies
    trim: true,       // removes extra spaces
  },
  industry: {
    type: String,
    required: true,   // e.g., "Machine Learning", "Web Dev"
    trim: true,
  },
  roles: [
    {
      type: String,   // list of roles offered
      trim: true,
    },
  ],
  requirements: [
    {
      type: String,   // list of skills needed
      trim: true,
    },
  ],
  website: {
    type: String,     // optional: company’s website
    trim: true,
  },


 // ✅ Add this part:
  hiringRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HiringRecord",
    },
  ],
});


const Company = mongoose.model("Company", companySchema);

export default Company;
