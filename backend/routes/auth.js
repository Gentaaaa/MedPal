// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const router = express.Router();

const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/roles");
const { sendVerificationEmail, sendDoctorWelcomeEmail } = require("../utils/sendEmail");

// === REGISTER ===
router.post("/register", async (req, res) => {
  const { name, email, password, role, clinicCode } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: "Të gjitha fushat janë të nevojshme" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Emaili ekziston tashmë." });

  const hashed = await bcrypt.hash(password, 10);

  if (role === "patient") {
    const code = crypto.randomBytes(3).toString("hex");
    const newUser = new User({ name, email, password: hashed, role, isVerified: false, verificationCode: code });
    await newUser.save();
    await sendVerificationEmail(email, code);
    return res.status(201).json({ message: "Verifikoni emailin." });
  }

  if (role === "clinic") {
    if (!process.env.CLINIC_CODES?.split(",").includes(clinicCode)) {
      return res.status(400).json({ message: "Kodi i klinikës nuk është valid." });
    }
    await new User({ name, email, password: hashed, role, isVerified: true }).save();
    return res.status(201).json({ message: "Klinika u regjistrua me sukses!" });
  }

  return res.status(403).json({ message: "Ky rol nuk lejohet të regjistrohet." });
});

// === VERIFY EMAIL ===
router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.verificationCode !== code) return res.status(400).json({ message: "Kodi i pasaktë." });

  user.isVerified = true;
  user.verificationCode = null;
  await user.save();
  res.json({ message: "Email u verifikua me sukses!" });
});

// === LOGIN ===
router.post("/login", async (req, res) => {
  const { email, password, expectedRole, adminSecret } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Email nuk ekziston." });

  if (user.role !== expectedRole) return res.status(403).json({ message: "Roli nuk përputhet." });

  if (expectedRole === "patient" && !user.isVerified) {
    return res.status(401).json({ message: "Verifikoni emailin." });
  }

  if (expectedRole === "admin" && adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Kodi sekret gabim." });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Fjalëkalim i pasaktë." });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

// === LOGIN DOCTOR ===
router.post("/login-doctor", async (req, res) => {
  const { doctorCode, password } = req.body;
  const doctor = await User.findOne({ doctorCode, role: "doctor" });
  if (!doctor) return res.status(404).json({ message: "Kodi i gabuar." });

  const match = await bcrypt.compare(password, doctor.password);
  if (!match) return res.status(401).json({ message: "Fjalëkalim i gabuar." });

  const token = jwt.sign({ id: doctor._id, role: doctor.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user: { _id: doctor._id, name: doctor.name, role: doctor.role, doctorCode: doctor.doctorCode } });
});

// === FORGOT / RESET PASSWORD ===
router.post("/forgot-password", async (req, res) => {
  const { email, role } = req.body;
  const user = await User.findOne({ email, role });
  if (!user) return res.status(404).json({ message: "Emaili nuk ekziston për këtë rol." });

  const code = crypto.randomBytes(3).toString("hex").toUpperCase();
  user.verificationCode = code;
  await user.save();
  await sendVerificationEmail(email, code, null, null, null, true);
  res.json({ message: "Kodi për ndryshim dërguar." });
});

router.post("/reset-password", async (req, res) => {
  const { email, role, code, newPassword } = req.body;
  const user = await User.findOne({ email, role });
  if (!user || user.verificationCode !== code) return res.status(400).json({ message: "Kodi i pasaktë." });

  user.password = await bcrypt.hash(newPassword, 10);
  user.verificationCode = null;
  await user.save();
  res.json({ message: "Fjalëkalimi u ndryshua me sukses!" });
});

module.exports = router;
