import User from "../models/usermodel.js";

// Get all certifications for current user
export const getCertifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("certifications");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.certifications || []);
  } catch (err) {
    console.error("getCertifications error:", err);
    res.status(500).json({ error: "Failed to fetch certifications" });
  }
};

// Add a certification
export const addCertification = async (req, res) => {
  try {
    const payload = req.body || {};
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.certifications.push(payload);
    await user.save();

    res.status(201).json(user.certifications[user.certifications.length - 1]);
  } catch (err) {
    console.error("addCertification error:", err);
    res.status(500).json({ error: "Failed to add certification" });
  }
};

// Update a certification by id
export const updateCertification = async (req, res) => {
  try {
    const { certId } = req.params;
    const updates = req.body || {};

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const cert = user.certifications.id(certId);
    if (!cert) return res.status(404).json({ error: "Certification not found" });

    Object.assign(cert, updates);
    await user.save();

    res.json(cert);
  } catch (err) {
    console.error("updateCertification error:", err);
    res.status(500).json({ error: "Failed to update certification" });
  }
};

// Delete a certification by id
export const deleteCertification = async (req, res) => {
  try {
    const { certId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const cert = user.certifications.id(certId);
    if (!cert) return res.status(404).json({ error: "Certification not found" });

    cert.deleteOne();
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("deleteCertification error:", err);
    res.status(500).json({ error: "Failed to delete certification" });
  }
};

// Upload certificate file (PDF/Image). The file is stored on disk, not in DB
export const uploadCertificationFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    // Build a public path served by express static, e.g. /uploads/certificates/<file>
    const publicPath = `/uploads/certificates/${req.file.filename}`;
    res.status(201).json({ path: publicPath, filename: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype });
  } catch (err) {
    console.error("uploadCertificationFile error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};
