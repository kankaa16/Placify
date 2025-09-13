import jwt from 'jsonwebtoken';
import UserModel from '../models/usermodel.js';
import Student from '../classes/Student.js';
import Admin from '../classes/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || "secretkeyxyz";

export const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.emailID },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

export const loginUser = async (email, password) => {
  let user = await Student.login(email, password);
  if (!user) user = await Admin.login(email, password);
  if (!user) throw new Error("Invalid credentials");

  const token = generateToken(user);
  return {
    user: {
      id: user._id,
      emailID: user.emailID,
      role: user.role,
      fName: user.fName || null,
      lName: user.lName || null
    },
    token
  };
};


export const registerUser = async (data) => {
  let user;
  if (data.role === "student") user = new Student(data);
  else if (data.role === "admin") user = new Admin(data.email, data.password);
  else throw new Error("Invalid role");

  const savedUser = await user.save();
  const token = generateToken(savedUser);
  return { user: savedUser, token };
};

export const getCurrentUser = async (id) => {
  const user = await UserModel.findById(id); 
  if (!user) throw new Error("User not found");

  return {
    id: user._id,
    emailID: user.emailID,
    role: user.role,
    fName: user.fName || null,
    lName: user.lName || null
  };
};

export const updateUserProfile = async (id, data) => {
  const updatedUser = await UserModel.findByIdAndUpdate(id, data, { new: true });
  if (!updatedUser) throw new Error("User not found");
  return updatedUser;
};
