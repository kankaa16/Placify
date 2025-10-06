import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js"; 
import authroute from "./routes/authroute.js";
import resumeRoutes from './routes/resumeroute.js'

const app = express();
const PORT = 5000;

connectDB();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

app.use("/api/auth", authroute);
app.use("/api/resume", resumeRoutes);



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
