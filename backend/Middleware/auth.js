const jwt = require("jsonwebtoken");
const Officer = require("../MongoDB/Schemas/ofiteriSchema");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) throw new Error("Autentificare necesară");
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const officer = await Officer.findById(decoded._id);
    if (!officer) throw new Error("Ofițerul nu a fost găsit");

    req.officer = officer;
    next();
  } catch (err) {
    res.status(401).json({ error: "Autentificare eșuată: " + err.message });
  }
};

module.exports = auth;
