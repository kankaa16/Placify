import User from "./User.js";

class Admin extends User {
  constructor(emailID, password) {
    super(emailID, password, "admin");
  }

  async save() {
    return super.save({});
  }
}

export default Admin;
