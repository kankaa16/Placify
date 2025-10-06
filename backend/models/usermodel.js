import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  completed: Number
}, { _id: false });

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["admin", "student"], required: true },

  // common fields for both , admin n student!!
  emailID: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // only-studnets
  fName: String,
  lName: String,
  initials: String,
  rollNumber: String,
  dept: String,
  batch: Number,
  status: String,
  readinessScore: Number,

  contact: {
    phone: String,
    location: String,
    dob: String
  },

  socials: {
    portfolio: String,
    linkedin: String,
    github: String,
    leetcode: String,
    codeforces: String, 
    other: String
  },

  academics: {
    cgpa: Number,
    backlogs: Number,
    grade10: String,
    grade12: String,
    jeeMains: String
  },
  resumeAnalysis: {
  role: String,
  score: Number,
  matchedSkills: [String],
  missingSkills: [String],
  parsedData: mongoose.Schema.Types.Mixed
}
,

  skills: [String],
  assessments: {
    technical: Number,
    aptitude: Number,
    communication: Number,
    coding: Number
  },

  certifications: [certificationSchema],

  preferences: {
    jobTypes: [String],
    locations: [String],
    industries: [String]
  }
});

export default mongoose.model("User", userSchema);
