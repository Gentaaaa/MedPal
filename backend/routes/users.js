// routes/users.js
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const { sendDoctorWelcomeEmail } = require("../utils/sendEmail");

// GET PROFILE
router.get("/me", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("departmentId", "name")
    .populate("services", "name");

  if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet." });
  res.json(user);
});

// UPDATE PROFILE
router.put("/me", verifyToken, async (req, res) => {
  const fields = req.body;
  const updated = await User.findByIdAndUpdate(req.user.id, fields, { new: true }).select("-password");
  res.json(updated);
});

// CHANGE PASSWORD
router.put("/me/password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({ message: "Fjalëkalimi aktual i pasaktë." });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Fjalëkalimi u ndryshua me sukses." });
});

// DELETE ACCOUNT
router.delete("/me", verifyToken, async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.json({ message: "Llogaria u fshi me sukses." });
});

// REGISTER DOCTOR (nga klinika)
router.post("/register-doctor", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") return res.status(403).json({ message: "Vetëm klinika mund të shtojë mjekë." });

  const { name, email, password, departmentId, services } = req.body;
  if (!name || !email || !password || !departmentId) {
    return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Emaili është në përdorim." });

  const hashedPassword = await bcrypt.hash(password, 10);
  const doctorCode = "DR" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const doctor = new User({
    name,
    email,
    password: hashedPassword,
    role: "doctor",
    clinicId: req.user.id,
    departmentId,
    services,
    doctorCode,
    isVerified: true,
  });

  await doctor.save();
  await sendDoctorWelcomeEmail(email, doctorCode, password);
  res.status(201).json({ message: "✅ Mjeku u regjistrua me sukses!", doctorCode });
});

module.exports = router;
