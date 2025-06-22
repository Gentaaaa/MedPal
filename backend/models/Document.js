// backend/models/Document.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: String,
  fileUrl: String,
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  appointmentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Appointment",
  required: false,
},

  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Document", documentSchema);
