import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { certUpload } from "../middlewares/upload.js";
import {
  getCertifications,
  addCertification,
  updateCertification,
  deleteCertification,
  uploadCertificationFile
} from "../controllers/certificationController.js";

const router = express.Router();

router.get("/", verifyToken, getCertifications);
router.post("/", verifyToken, addCertification);
router.put("/:certId", verifyToken, updateCertification);
router.delete("/:certId", verifyToken, deleteCertification);
router.post(
  "/upload",
  verifyToken,
  (req, res, next) => {
    certUpload.single("file")(req, res, (err) => {
      if (err && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "File too large. Max 2 MB allowed." });
      }
      if (err) return res.status(400).json({ error: err.message || "Upload error" });
      next();
    });
  },
  uploadCertificationFile
);

export default router;
