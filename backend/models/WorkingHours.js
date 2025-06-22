const mongoose = require("mongoose");

const workingHourSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  day: { type: String, required: true }, // "Monday", "Tuesday", ...
  startTime: { type: String, required: true }, // "08:00"
  endTime: { type: String, required: true },   // "16:00"
});

module.exports = mongoose.model("WorkingHour", workingHourSchema);
