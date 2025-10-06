import pdfParse from "pdf-parse-fixed";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/usermodel.js";

const roleSkillsMap = {
  fullstack: [
    { name: "JS Stack", skills: ["JavaScript", "TypeScript", "React", "NextJS", "Node.js", "Express", "HTML", "CSS", "Git"] },
    { name: "Python Stack", skills: ["Python", "Django", "Flask", "SQL", "Git"] },
    { name: "Java Stack", skills: ["Java", "Spring", "Spring Boot", "SQL", "Git"] }
  ],
  frontend: [
    { name: "JS Frontend", skills: ["JavaScript", "TypeScript", "React", "NextJS", "Vue", "Angular", "HTML", "CSS", "Git"] },
    { name: "Java Stack", skills: ["Java", "Spring", "Spring Boot", "SQL", "Git"] },
    { name: "Python Stack", skills: ["Python", "Django", "Flask", "SQL", "Git"] }
  ],
  backend: [
    { name: "Node Backend", skills: ["Node.js", "Express", "SQL", "MongoDB", "Git"] },
    { name: "Python Backend", skills: ["Python", "Django", "Flask", "SQL", "Git"] },
    { name: "Java Backend", skills: ["Java", "Spring", "Spring Boot", "SQL", "Git"] }
  ],
  datascience: [
    { name: "Python DS", skills: ["Python", "R", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "SQL"] },
    { name: "Matlab DS", skills: ["Matlab", "Statistics", "EDA", "Data Visualization"] }
  ],
  ai: [
    { name: "Python AI", skills: ["Python", "TensorFlow", "PyTorch", "Keras", "Machine Learning", "Deep Learning", "NLP", "Computer Vision"] },
    { name: "Matlab AI", skills: ["Matlab", "Algorithms", "Statistics"] }
  ],
  cs: [
    { name: "Core CS", skills: ["C", "C++", "Python", "Java","Go", "Rust", "Algorithms", "Data Structures", "OOP", "DBMS", "Operating Systems", "Networking", "Git"] }
  ],
  it: [
    { name: "Core IT", skills: ["Networking", "Linux", "Database", "Cloud Computing", "IT Support", "Cybersecurity", "Python", "Java"] }
  ],
  ece: [
    { name: "Core ECE", skills: ["Analog Electronics", "Digital Electronics", "Microcontrollers", "VLSI", "Signals and Systems", "Communication", "Matlab"] }
  ],
  ee: [
    { name: "Core EE", skills: ["Circuit Analysis", "Power Systems", "Control Systems", "Electrical Machines", "Matlab", "Simulink"] }
  ],
  devops: [
    { name: "Core DevOps", skills: ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Terraform", "Ansible", "Linux", "Bash", "Monitoring", "Jenkins", "Git"] }
  ],
  mobile: [
    { name: "JS Mobile", skills: ["React Native", "Flutter", "Kotlin", "Swift", "Go", "Rust", "Android", "iOS", "Git", "REST API", "Firebase", "Expo"] }
  ]
};
//juss for typing checks in resume
const skillAliases = {
  "javascript": ["javascript", "js"],
  "typescript": ["typescript", "ts"],
  "react": ["react", "reactjs"],
  "nextjs": ["nextjs", "next.js"],
  "vue": ["vue", "vuejs"],
  "angular": ["angular", "angularjs"],
  "node.js": ["node", "nodejs", "node.js"],
  "express": ["express", "expressjs", "express.js"],
  "python": ["python", "py"],
  "django": ["django"],
  "flask": ["flask"],
  "java": ["java"],
  "spring": ["spring"],
  "spring boot": ["springboot", "spring boot"],
  "c": ["c"],
  "c++": ["c++", "cpp"],
  "go": ["go", "golang"],
  "rust": ["rust"],
  "html": ["html", "html5"],
  "css": ["css", "css3"],
  "sass": ["sass", "scss"],
  "tailwind": ["tailwind", "tailwindcss", "tailwind css"],
  "bootstrap": ["bootstrap", "bootstrap4", "bootstrap5"],
  "git": ["git", "github", "gitlab"],
  "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite"],
  "mongodb": ["mongodb", "mongo"],
  "rest api": ["rest api", "restapi", "rest"],
  "graphql": ["graphql"],
  "docker": ["docker"],
  "kubernetes": ["kubernetes", "k8s"],
  "aws": ["aws", "amazon web services"],
  "azure": ["azure", "microsoft azure"],
  "gcp": ["gcp", "google cloud"],
  "ci/cd": ["ci/cd", "ci cd", "continuous integration", "continuous deployment"],
  "terraform": ["terraform"],
  "ansible": ["ansible"],
  "bash": ["bash", "shell scripting", "shell"],
  "linux": ["linux", "unix"],
  "tensorflow": ["tensorflow", "tf"],
  "pytorch": ["pytorch", "torch"],
  "keras": ["keras"],
  "machine learning": ["machine learning", "ml"],
  "deep learning": ["deep learning", "dl"],
  "nlp": ["nlp", "natural language processing"],
  "computer vision": ["computer vision", "cv"],
  "matlab": ["matlab"],
  "eda": ["eda", "exploratory data analysis"],
  "statistics": ["statistics", "stats"],
  "algorithms": ["algorithms", "algo"],
  "data structures": ["data structures", "ds"],
  "oop": ["oop", "object oriented programming", "object-oriented programming"],
  "dbms": ["dbms", "database management system"],
  "operating systems": ["operating systems", "os"],
  "networking": ["networking", "networks"],
  "react native": ["react native", "react-native"],
  "flutter": ["flutter"],
  "kotlin": ["kotlin"],
  "swift": ["swift"],
  "android": ["android"],
  "ios": ["ios"],
  "firebase": ["firebase"],
  "expo": ["expo"]
};
//lower cased text!!
const normalizeSkill = skill => skill.toLowerCase().replace(/\./g, '').trim();

// checks if a skill matches resume text
const skillMatchesText = (skill, text) => {
  const aliases = skillAliases[skill.toLowerCase()] || [skill];
  return aliases.some(alias => text.includes(normalizeSkill(alias)));
};


const parsePDF = async (fileBuffer) => {
  const data = await pdfParse(fileBuffer);
  return data.text;
};

// cpi calc
const getCGPAScore = (text) => {
  const match = text.match(/(\d(\.\d{1,2})?)\/?10|100/gi);
  if (!match) return 0;
  const cgpa = parseFloat(match[0]);
  return cgpa > 10 ? (cgpa / 100) * 100 : (cgpa / 10) * 100;
};

// exprnce calc
const getExperienceScore = (text, matchedSkills) => {
  let score = 0;
  const expMatches = text.match(/(\d+)\s+years?/gi) || [];
  score += Math.min(expMatches.map(x => parseInt(x)).reduce((a,b) => a+b,0) * 10, 50);
  const bonus = matchedSkills.length > 0 ? 30 : 0;
  return Math.min(score + bonus, 100);
};

// formatting checks
const checkFormatting = (text) => {
  const sections = ["contact", "summary", "education", "experience", "skills", "projects"];
  const sectionPresence = {};
  sections.forEach(section => {
    sectionPresence[section] = text.toLowerCase().includes(section);
  });
  const formattingScore = Math.round(
    (Object.values(sectionPresence).filter(v => v).length / sections.length) * 100
  );
  return { formattingScore, sectionPresence };
};

// suggestion lines
const suggestionTemplates = [
  skill => `Showcase your expertise in ${skill} through projects or work experience.`,
  skill => `Enhance your resume by highlighting skills in ${skill}.`,
  skill => `Demonstrate proficiency in ${skill} for this role.`,
  skill => `Include examples where you applied ${skill}.`,
  skill => `Strengthen your resume with accomplishments in ${skill}.`,
  skill => `Adding ${skill} could boost your chances for this role.`
];

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF file is required" });

    const pdfText = await parsePDF(req.file.buffer);
    const lowerText = pdfText.toLowerCase();

    const selectedRole = req.body.role?.toLowerCase() || "fullstack";
    const stacks = roleSkillsMap[selectedRole] || roleSkillsMap.fullstack;

//find best stack from all skills ie got from resume
    let bestStack = null;
    let maxMatched = 0;
    let matchedSkills = [];
    let missingSkills = [];

    stacks.forEach(stack => {
      const matched = stack.skills.filter(skill => skillMatchesText(skill, lowerText));
      if (matched.length > maxMatched) {
        maxMatched = matched.length;
        bestStack = stack.name;
        matchedSkills = matched;
        missingSkills = stack.skills.filter(s => !matched.includes(s));
      }
    });

   //score calc
    const atsScore = Math.round((matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100);
    const cgpaScore = getCGPAScore(pdfText);
    const experienceScore = getExperienceScore(pdfText, matchedSkills);
    const { formattingScore, sectionPresence } = checkFormatting(pdfText);

    let overallScore = Math.round(
  atsScore * 0.5 + formattingScore * 0.2 + experienceScore * 0.2 + cgpaScore * 0.1
);

//gives suggestions randomly!!

    const suggestions = missingSkills.map(skill => {
      const randomIndex = Math.floor(Math.random() * suggestionTemplates.length);
      return suggestionTemplates[randomIndex](skill);
    });

    Object.entries(sectionPresence).forEach(([section, present]) => {
      if (!present) suggestions.push(`Add a ${section.charAt(0).toUpperCase() + section.slice(1)} section for clarity.`);
    });

    //for db update
if (req.user && req.user.id) {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      resumeAnalysis: {
        role: selectedRole,
        score: overallScore,
        matchedSkills,
        missingSkills,
        parsedData: pdfText
      },
      readinessScore: overallScore 
    },
    { new: true } 
  );
}


    res.json({
      atsScore,
      cgpaScore,
      experienceScore,
      formattingScore,
      overallScore,
      matchedSkills,
      missingSkills,
      bestStack,
      suggestions,
      role: selectedRole,
    });

  } catch (err) {
    console.error("Resume analysis failed:", err);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
};
