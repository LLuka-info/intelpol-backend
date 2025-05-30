const mongoose = require("mongoose");

const istoricSchema = new mongoose.Schema({
  officer: { type: mongoose.Schema.Types.ObjectId, ref: "Ofiteri", required: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen", required: true },
  changes: { type: Array },
  addedConvictii: [{
    tip: String,
    descriere: String
  }],
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model("istoric", istoricSchema);
