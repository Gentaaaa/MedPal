const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: function () {
      return this.role !== "doctor"; // vetëm jo-mjekët e kanë të detyrueshëm
    },
    unique: true,
    sparse: true,
  },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["patient", "doctor", "clinic", "admin"],
    required: true,
  },

  // Vetëm për pacientët
  gender: { type: String, enum: ["male", "female", "other"] },
  phone: { type: String },
  address: { type: String },
  bloodType: { type: String },
  medicalHistory: { type: String },

  // Verifikimi për pacientët
  isVerified: {
    type: Boolean,
    default: function () {
      return this.role !== "patient"; // pacientët fillimisht false
    },
  },
  verificationCode: { type: String },

  // Vetëm për mjekët
  doctorCode: {
    type: String,
    unique: true,
    sparse: true,
  },

  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },

  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
  ],

  // Orari i punës për mjekët
  workingHours: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String },
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
