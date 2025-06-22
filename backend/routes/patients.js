// routes/patients.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const crypto = require("crypto");

// POST /api/patients/invite
router.post("/invite", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinika mund të ftojë pacientë." });
  }

  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Emri dhe emaili janë të detyrueshëm." });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Ky email është i regjistruar tashmë." });

  const code = crypto.randomBytes(3).toString("hex").toUpperCase();

  const newUser = new User({
    name,
    email,
    role: "patient",
    clinicId: req.user.id,
    isVerified: false,
    verificationCode: code,
  });

  await newUser.save();

const link = `${process.env.CLIENT_URL}/verify-invite?email=${encodeURIComponent(email)}&code=${code}`;
  await sendVerificationEmail(email, code, link, name, req.user.name); // përfshij emrin e klinikës

  res.status(201).json({ message: "Ftesa u dërgua me sukses." });
});

module.exports = router;
