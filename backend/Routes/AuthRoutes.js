const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Officer = require("../MongoDB/Schemas/ofiteriSchema");
const auth = require("../Middleware/auth");

router.post("/login", async (req, res) => {
  try {
    const { fullName, password } = req.body;
    if (!fullName || !password) {
      return res.status(400).send("Numărul de insignă și parola sunt obligatorii");
    }

    const officer = await Officer.findOne({ fullName });
    if (!officer) return res.status(404).send("Ofițer negăsit");

    if (password !== officer.password) return res.status(401).send("Parolă invalidă");

    if (!process.env.JWT_SECRET) {
      throw new Error("Lipsă configurare JWT");
    }

    officer.activePatrol = true;
    await officer.save();

    const token = jwt.sign({ _id: officer._id }, process.env.JWT_SECRET);

    res.header("auth-token", token).json({
      token,
      officer: {
        _id: officer._id,
        fullName: officer.fullName,
        rank: officer.rank
      }
    });

  } catch (err) {
    console.error("Eroare autentificare:", err);
    res.status(500).send("Eroare server la autentificare");
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.officer.activePatrol = false;
    await req.officer.save();
    res.send({ message: "Delogat cu succes și status actualizat." });
  } catch (err) {
    console.error("Eroare la delogare:", err);
    res.status(500).send("Eroare server la delogare");
  }
});


module.exports = router;