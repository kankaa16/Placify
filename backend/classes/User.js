import UserModel from "../models/usermodel.js";
import bcrypt from "bcryptjs";

class User {
  constructor(emailID, password, role) {
    this.emailID = emailID;
    this.password = password;
    this.role = role;
  }

  async save(extraFields = {}) {
    const hashed = await bcrypt.hash(this.password, 10);
    const doc = new UserModel({
      emailID: this.emailID,
      password: hashed,
      role: this.role,
      ...extraFields
    });
    return await doc.save();
  }

  static async login(email, password) {
  const user = await UserModel.findOne({ emailID: email });
  if (!user) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;
  return user;
}

}

export default User;
