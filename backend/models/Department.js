const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Emri i departamentit (p.sh. Kardiologji, Dermatologji)
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Vetëm userat me rol "clinic"
  },
});

module.exports = mongoose.model("Department", departmentSchema);
