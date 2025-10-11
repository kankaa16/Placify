import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  completed: Number
}, { _id: false });

const platformStatsSchema = new mongoose.Schema({
  platform: { type: String }, // "leetcode", "codeforces", "github", etc.
  username: String,
  solvedProblems: Number,
  contests: Number,
  rating: Number,
  maxRating: Number,
  rank: String,
  stars: Number,
  repos: Number,
  followers: Number,
  commitsLastYear: Number,
  models: Number,
  downloads: Number
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
  university: String,  
  branch: String,  
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
  codechef: String,
  hackerrank: String,
  other: [
    {
      platformName: String,
      handle: String,
      solvedProblems: Number,
      rating: Number,
      contests: Number
    }
  ]
},
platformStats: [platformStatsSchema],

  readinessScoreHistory: [
    {
      score: Number,
      date: { type: Date, default: Date.now }
    }
  ],

readinessScoreHistory: [
  {
    score: Number,
    date: { type: Date, default: Date.now }
  }
]
,
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
  assessments: [
  {
    name: String,
    score: Number
  }
],


  certifications: [certificationSchema],

  preferences: {
    jobTypes: [String],
    locations: [String],
    industries: [String]
  }
});

export default mongoose.model("User", userSchema);
