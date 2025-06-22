const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Emri i shërbimit (p.sh. Kontrolla e përgjithshme)
  price: Number,                           // Çmimi i shërbimit (opsional)
  departmentId: {                          // Lidhja me departamentin përkatës
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
});

module.exports = mongoose.model("Service", serviceSchema);
