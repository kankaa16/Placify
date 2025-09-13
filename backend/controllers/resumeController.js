import pdfParse from "pdf-parse-fixed";

const roleSkillsMap = {
  fullstack: [
    "JavaScript", "TypeScript", "React", "Vue", "Angular",
    "Node.js", "Express", "MongoDB", "SQL", "HTML", "CSS",
    "Git", "REST API", "GraphQL", "Docker", "Go", "Rust","PHP","Laravel"
  ],
  frontend: [
    "JavaScript", "TypeScript", "React", "Vue", "Angular",
    "HTML", "CSS", "SASS", "Tailwind", "Bootstrap", "Go",
    "Git", "Responsive Design", "Web Performance Optimization"
  ],
  backend: [
    "Node.js", "Express", "Python", "Django", "Flask",
    "Java", "Spring", "SQL", "MongoDB", "REST API","Rust",
    "GraphQL", "Docker", "Kubernetes", "Git","C++","Python","Go",
  ],
  datascience: [
    "Python", "R", "Pandas", "NumPy", "Scikit-learn",
    "TensorFlow", "PyTorch", "SQL", "Data Visualization",
    "Matplotlib", "Seaborn", "Machine Learning", "Deep Learning",
    "Statistics", "EDA","Matlab"
  ],
  ai: [
    "Python", "TensorFlow", "PyTorch", "Keras", "Machine Learning",
    "Deep Learning", "Computer Vision", "NLP", "Reinforcement Learning",
    "Data Preprocessing", "Algorithms","Matlab"
  ],
  cs: ["C", "C++", "Python", "Java","Go", "Rust", "Algorithms", "Data Structures", "OOP", "DBMS", "Operating Systems", "Networking", "Git"],
  it: ["Networking", "Linux", "Database", "Cloud Computing", "IT Support", "Cybersecurity", "Python", "Java"],
  ece: ["Analog Electronics", "Digital Electronics", "Microcontrollers", "VLSI", "Signals and Systems", "Communication", "Matlab"],
  ee: ["Circuit Analysis", "Power Systems", "Control Systems", "Electrical Machines", "Matlab", "Simulink"],
  devops: [
    "Docker", "Kubernetes", "AWS", "Azure", "GCP",
    "CI/CD", "Terraform", "Ansible", "Linux", "Bash",
    "Monitoring", "Jenkins", "Git"
  ],
  mobile: [
    "React Native", "Flutter", "Kotlin", "Swift", "Go", "Rust",
    "Android", "iOS", "Git", "REST API", "Firebase", "Expo"
  ]
};

const parsePDF = async (fileBuffer) => {
  const data = await pdfParse(fileBuffer);
  return data.text;
};

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF file is required" });

    const pdfText = await parsePDF(req.file.buffer);
    const lowerText = pdfText.toLowerCase();

    const selectedRole = req.body.role?.toLowerCase() || "fullstack";
    const requiredSkills = roleSkillsMap[selectedRole] || roleSkillsMap.fullstack;

    const matchedSkills = requiredSkills.filter(skill =>
      lowerText.includes(skill.toLowerCase())
    );
    const missingSkills = requiredSkills.filter(skill => !matchedSkills.includes(skill));

    const atsScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);

    const suggestionTemplates = [
  skill => `Showcase your expertise in ${skill} through projects or work experience.`,
  skill => `Enhance your resume by highlighting skills in ${skill}.`,
  skill => `Demonstrate proficiency in ${skill} for this role.`,
  skill => `Include examples where you applied ${skill}.`,
  skill => `Strengthen your resume with accomplishments in ${skill}.`,
  skill => `Adding ${skill} could boost your chances for this role.`,
];

const suggestions = missingSkills.map(skill => {
  const randomIndex = Math.floor(Math.random() * suggestionTemplates.length);
  return suggestionTemplates[randomIndex](skill);
});


    res.json({
      atsScore,
      matchedSkills,
      missingSkills,
      suggestions,
      role: selectedRole,
    });
  } catch (err) {
    console.error("Resume analysis failed:", err);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
};
