const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },

  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "canceled"],
    default: "pending",
attended: {
  type: Boolean,
  default: false,
  isPresent: { type: Boolean, default: false }

}


  },

  seenByPatient: { type: Boolean, default: false }, // 🆕
});

module.exports = mongoose.model("Appointment", appointmentSchema);
