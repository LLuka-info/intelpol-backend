const mongoose = require("mongoose");


const officerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  badgeNumber: { type: String, unique: true },
  rank: { type: String, enum: ["Agent", "Sergent", "Locotenent", "Căpitan"] },
  password: { type: String, required: true },
  activePatrol: { type: Boolean, default: false }
});

module.exports = mongoose.model("Ofiteri", officerSchema);