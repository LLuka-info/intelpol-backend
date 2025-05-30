// routes/ofiteri.js
const express = require("express");
const router  = express.Router();
const Officer = require("../MongoDB/Schemas/ofiteriSchema");
const Counter = require("../MongoDB/Schemas/idSchema");
const auth    = require("../Middleware/auth");

// GET all officers (admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (req.officer.role !== "admin") {
      return res.status(403).json({ message: "Acces interzis" });
    }
    const officers = await Officer.find().select("-password"); // exclude passwords
    res.json(officers);
  } catch (err) {
    console.error("Eroare la preluarea ofițerilor:", err);
    res.status(500).json({ message: "Eroare server." });
  }
});

// GET active officers
router.get("/activi", auth, async (req, res) => {
  try {
    const officers = await Officer.find({ activePatrol: true }).select("-password");
    res.json(officers);
  } catch (err) {
    console.error("Eroare la preluarea ofițerilor activi:", err);
    res.status(500).json({ message: "Eroare server." });
  }
});

// GET logged-in officer profile
router.get("/profile", auth, async (req, res) => {
  res.json(req.officer);
});

// PATCH update activePatrol status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { activePatrol } = req.body;
    const officer = await Officer.findByIdAndUpdate(
      req.params.id,
      { activePatrol },
      { new: true }
    ).select("-password");
    if (!officer) return res.status(404).json({ message: "Ofițer negăsit." });
    res.json(officer);
  } catch (err) {
    console.error("Eroare actualizare status:", err);
    res.status(500).json({ message: "Eroare server." });
  }
});

// POST create new officer (admin only) with auto‑increment badgeNumber
router.post("/", auth, async (req, res) => {
  try {
    if (req.officer.role !== "admin") {
      return res.status(403).json({ message: "Acces interzis" });
    }

    // 1. Atomically get next badge sequence
    const counter = await Counter.findOneAndUpdate(
      { _id: "officerBadge" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // 2. Create officer with that badgeNumber
    const officer = new Officer({
      ...req.body,
      badgeNumber: counter.seq
    });

    await officer.save();

    const toReturn = officer.toObject();
    delete toReturn.password;
    res.status(201).json(toReturn);

  } catch (err) {
    console.error("Eroare la crearea ofițerului:", err);
    res.status(400).json({ message: err.message });
  }
});

// PUT update officer by ID (admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.officer.role !== "admin") {
      return res.status(403).json({ message: "Acces interzis" });
    }

    const updateData = { ...req.body };

    // If password is empty or missing, don’t overwrite
    if (!updateData.password || updateData.password.trim() === "") {
      delete updateData.password;
    }

    const officer = await Officer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!officer) return res.status(404).json({ message: "Ofițer negăsit." });
    res.json(officer);

  } catch (err) {
    console.error("Eroare la actualizarea ofițerului:", err);
    res.status(500).json({ message: "Eroare server." });
  }
});

module.exports = router;
