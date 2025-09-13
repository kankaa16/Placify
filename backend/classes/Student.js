import User from "./User.js";

class Student extends User {
  constructor(data) {
    super(data.email, data.password, "student");

    this.fName = data.firstName || "";
    this.lName = data.lastName || "";
    this.initials = (data.firstName?.[0] || "") + (data.lastName?.[0] || "");
    this.rollNumber = data.studentId || "";
    this.dept = data.branch || "";
    this.batch = data.graduationYear || null;
    this.status = "active";
    this.readinessScore = 0; 

    this.contact = {
      phone: data.phone || "",
      location: data.location || "",
      dob: data.dob || ""
    };

    this.socials = {
      portfolio: data.portfolio || "",
      linkedin: data.linkedin || "",
      github: data.github || "",
      leetcode: data.leetcode || "",
      other: data.other || ""
    };

    this.academics = {
      cgpa: data.cgpa || null,
      backlogs: data.backlogs || 0,
      grade10: data.grade10 || "",
      grade12: data.grade12 || "",
      jeeMains: data.jeeMains || ""
    };

    this.skills = data.skills || [];
    this.assessments = {
      technical: 0,
      aptitude: 0,
      communication: 0,
      coding: 0
    };

    this.certifications = data.certifications || [];
    this.preferences = {
      jobTypes: data.jobTypes || [],
      locations: data.locations || [],
      industries: data.industries || []
    };
  }

  async save() {
    return super.save({
      fName: this.fName,
      lName: this.lName,
      initials: this.initials,
      rollNumber: this.rollNumber,
      dept: this.dept,
      batch: this.batch,
      status: this.status,
      readinessScore: this.readinessScore,
      contact: this.contact,
      socials: this.socials,
      academics: this.academics,
      skills: this.skills,
      assessments: this.assessments,
      certifications: this.certifications,
      preferences: this.preferences
    });
  }
}

export default Student;
