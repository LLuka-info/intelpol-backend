const express = require("express");
const router = express.Router();
const Officer = require("../MongoDB/Schemas/ofiteriSchema");
const auth = require("../middleware/auth");

router.get("/activi", auth, async (req, res) => {
  try {
    const officers = await Officer.find({ activePatrol: true });
    res.json(officers);
  } catch (err) {
    console.error("Eroare la preluarea ofițerilor activi:", err);
    res.status(500).json({ message: "Eroare server." });
  }
});

router.get("/profile", auth, async (req, res) => {
  res.json(req.officer);
});

router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { activePatrol } = req.body;
    const officer = await Officer.findByIdAndUpdate(
      req.params.id, 
      { activePatrol },
      { new: true }
    );
    if (!officer) return res.status(404).json({ message: "Ofițer negăsit." });
    res.json(officer);
  } catch (err) {
    console.error("Eroare actualizare status:", err);
    res.status(500).json({ message: "Eroare server." });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    // Verificare drepturi admin
    if(req.officer.role !== 'admin') {
      return res.status(403).json({ message: "Acces interzis" });
    }
    
    const officer = new Officer(req.body);
    await officer.save();
    res.status(201).json(officer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
