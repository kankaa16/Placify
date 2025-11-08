// ADMIN sends interview invite
router.patch("/:id/send-invite", verifyToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Unauthorized" });

  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "interview_invited" },
      { new: true }
    );
    res.json({ message: "Interview invite sent", app });
  } catch (err) {
    res.status(500).json({ error: "Failed to send invite" });
  }
});

// STUDENT accepts invite
router.patch("/:id/accept-invite", verifyToken, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (String(app.student) !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    app.status = "interview_accepted";
    await app.save();
    res.json({ message: "Interview accepted", app });
  } catch (err) {
    res.status(500).json({ error: "Could not accept invite" });
  }
});

// STUDENT uploads offer letter
router.patch("/:id/upload-offer", verifyToken, async (req, res) => {
  try {
    const { offeredRole, offeredCTC, offerLetterUrl, offerNote } = req.body;
    const app = await Application.findById(req.params.id);
    if (String(app.student) !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    app.status = "offer_uploaded";
    app.offeredRole = offeredRole;
    app.offeredCTC = offeredCTC;
    app.offerLetterUrl = offerLetterUrl;
    app.offerNote = offerNote;
    app.uploadedAt = new Date();

    await app.save();
    res.json({ message: "Offer uploaded successfully", app });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// ADMIN verifies final offer
router.patch("/:id/verify-offer", verifyToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Unauthorized" });

  try {
    const { action } = req.body;
    const app = await Application.findById(req.params.id);

    if (action === "approve") {
      app.status = "final_verified";
      app.verifiedAt = new Date();
    } else if (action === "reject") {
      app.status = "interview_accepted";
    }

    await app.save();
    res.json({ message: `Offer ${action}d`, app });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});
