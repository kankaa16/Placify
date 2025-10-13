import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ensureDir = (dirPath) => {
  try { fs.mkdirSync(dirPath, { recursive: true }); } catch {}
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve to backend/uploads/certificates regardless of where the process is started
const CERT_DIR = path.resolve(__dirname, "../uploads/certificates");
ensureDir(CERT_DIR);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(CERT_DIR);
    cb(null, CERT_DIR);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg"
  ];
  if (allowed.includes(file.mimetype)) cb(null, true); else cb(new Error("Only PDF/PNG/JPG allowed"));
};

export const certUpload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
