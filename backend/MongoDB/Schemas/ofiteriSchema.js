const mongoose = require("mongoose");


const officerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  badgeNumber: { type: String, unique: true },
  rank: { type: String, required: true },
  password: { type: String, required: true },
  activePatrol: { type: Boolean, default: false },
  role: { type: String, enum: ['admin', 'officer'], default: 'officer' }
});

module.exports = mongoose.model("Ofiteri", officerSchema);