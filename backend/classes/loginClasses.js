class User{
  constructor(fName, lName, emailID, password){
    this.fName = fName;
    this.emailID = emailID;
    this.lName = lName;
    this.password = password;
  }

  login(inputID, inputPW){
    return this.emailID === inputID && this.password === inputPW;
  }
}

class Student extends User{
  constructor(fName, lName, emailID, password, contactNumber){
    super(fName, lName, emailID, password);
    this.name = name;
    this.email = email;
    this.contactNumber = contactNumber;
  }

  displayProfile(){
  console.log(`Name: ${this.name}`);
  console.log(`Email: ${this.email}`);
  console.log(`Contact: ${this.contactNumber}\n`);
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

const admin = new Admin();
const s1 = new Student("student1", "pass123", "Riya", "riya@gmail.com", "1234567890");

s1.displayProfile();
admin.displayProfile();

console.log("Student login attempt:", s1.login("student001", "pass123") ? "Success" : "Failed");
console.log("Admin login attempt:", admin.login("admin123", "admin@pass") ? "Success" : "Failed");
