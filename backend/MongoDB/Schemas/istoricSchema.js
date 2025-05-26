const mongoose = require("mongoose");

const istoricSchema = new mongoose.Schema({
  officer: { type: mongoose.Schema.Types.ObjectId, ref: "Ofiter", required: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: "Cetatean", required: true },
  changes: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("istoric", istoricSchema);
