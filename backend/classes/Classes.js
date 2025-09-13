class User{
  constructor( emailID, password){
    this.emailID = emailID;
    this.password = password;
  }

  login(inputID, inputPW){
    return this.emailID === inputID && this.password === inputPW;
  }
}

class Student extends User{
  constructor(fName, lName, emailID, password){
    super(emailID, password);
    this.name = fName;
    this.lName=lName;
    this.email = email;

  }

  displayProfile(){
  console.log(`Name: ${this.name}`);
  console.log(`Email: ${this.email}`);
  }
}

class Admin extends User{
  constructor(){
    super("admin123", "admin@pass");
  }

  displayProfile() {
    console.log(`Admin Profile: Email ID: ${this.emailID}`);
    console.log(`Admin Profile: Password: ${this.password}\n`);
  }
}

class Company{
  constructor(name, industry){
    this.name = name;
    this.industry = industry;
  }

  getName() {return this.name;}
  getIndustry() {return this.industry;}
  display() {console.log(`${this.name} (${this.industry})`);}
}

class JobPosition{
  constructor(title, company, minCGPA, allowedStreams){
    this.title = title;
    this.company = company;
    this.minCGPA = minCGPA;
    this.allowedStreams = allowedStreams;
  }

  display() {console.log(`${this.title} at ${this.company.getName()}`);}

  getJobType() { throw new Error("Method 'getJobType()' must be implemented.");}
}


class Internship extends JobPosition{
  constructor(title, company, minCGPA, allowedStreams, durationMonths, monStipend){
    super(title, company, minCGPA, allowedStreams);
    this.durationMonths = durationMonths;
    this.monStipend = monStipend;
  }

  display() {console.log(`${this.title}: Internship at ${this.company.getName()} (${this.durationMonths} months - Monthly Stipend: ${this.monStipend})`);}

  getJobType() {return "Internship";}
}

class FullTime extends JobPosition{
  constructor(title, company, minCGPA, allowedStreams, salaryPackage){
    super(title, company, minCGPA, allowedStreams);
    this.salaryPackage = salaryPackage;
  }

  display() { console.log(`${this.title}: Full-Time at ${this.company.getName()} [Salary: ${this.salaryPackage}]`);}

  getJobType() {return "Full-time";}
}

class PlacementData{
  constructor(year, company, numBoys, numGirls, highestPackage, lowestPackage, averagePackage){
    this.year = year;
    this.company = company;
    this.numBoys = numBoys;
    this.numGirls = numGirls;
    this.numStudents = numBoys + numGirls;
    this.highestPackage = highestPackage;
    this.lowestPackage = lowestPackage;
    this.averagePackage = averagePackage;
  }

  display(){
    console.log(`${this.company.getName()} (${this.year}) - ${this.numStudents} students placed`);
    console.log(`Highest package: ${this.highestPackage}`);
    console.log(`Lowest package: ${this.lowestPackage}`);
    console.log(`Average package: ${this.averagePackage}`);
  }
}

const google = new Company("Google", "Tech");
const microsoft = new Company("Microsoft", "Tech");
const amazon = new Company("Amazon", "E-Commerce");

const ftJob = new FullTime("Software Engineer", google, 8.5, ["CSE", "ECE"], 25000);
const internJob = new Internship("Software Intern", amazon, 8.0, ["CSE"], 3, 1000);

const jobs = [internJob, ftJob];

const google2024 = new PlacementData(2024, google, 15, 10, 100000, 20000, 60000);
const google2023 = new PlacementData(2023, google, 25, 9, 95000, 10000, 50000);
const amazon2024 = new PlacementData(2024, amazon, 10, 8, 90000, 25000, 45000);

const placement = [google2023, google2024, amazon2024];

jobs.forEach(job => job.display());

placement.forEach(data => data.display());


const admin = new Admin();
const s1 = new Student("student1", "pass123", "Riya", "riya@gmail.com", "1234567890");

s1.displayProfile();
admin.displayProfile();

console.log("Student login attempt:", s1.login("student001", "pass123") ? "Success" : "Failed");
console.log("Admin login attempt:", admin.login("admin123", "admin@pass") ? "Success" : "Failed");
