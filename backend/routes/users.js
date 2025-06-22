const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");
const sendVerificationEmail = require("../utils/sendEmail");

// 📥 Merr të dhënat e profilit të kyçur
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së të dhënave." });
  }
});

// 🔁 Përditëso profilin
// 🔁 Përditëso profilin (me të gjitha fushat e pacientit)
// 🔁 Përditëso profilin
router.put("/me", verifyToken, async (req, res) => {
  try {
    const {
      name,
      email,
      dateOfBirth,
      gender,
      phone,
      address,
      bloodType,
      medicalHistory,
    } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        dateOfBirth,
        gender,
        phone,
        address,
        bloodType,
        medicalHistory,
      },
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    console.error("❌ Gabim gjatë përditësimit të profilit:", err);
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});

// 📋 Merr listën e mjekëve (vetëm për klinika)
router.get("/doctors", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinika ka qasje" });
  }

  try {
    const doctors = await User.find({ role: "doctor", clinicId: req.user.id }).select("-password");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së mjekëve." });
  }
});

// ➕ Regjistro mjek nga klinika
router.post("/register-doctor", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "clinic") {
      return res.status(403).json({ message: "Vetëm klinikat mund të regjistrojnë mjekë." });
    }

    const { name, email, departmentId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Emri dhe emaili janë të detyrueshëm." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Ky email është tashmë i përdorur." });
    }

    const generatedPassword = crypto.randomBytes(4).toString("hex"); // shembull: ab34cd78
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newDoctor = new User({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
      isVerified: true,
      clinicId: req.user.id,
      departmentId: departmentId || null,
    });

    await newDoctor.save();

    // 📧 Dërgo email me kredencialet për login
    try {
      await sendVerificationEmail(
        email,
        `
        <p>Përshëndetje ${name},</p>
        <p>Ju jeni shtuar si mjek në MedPal nga klinika.</p>
        <p>Kredencialet tuaja janë:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Fjalëkalimi:</strong> ${generatedPassword}</li>
        </ul>
        <p>Kyçuni dhe ndryshoni fjalëkalimin nëse dëshironi.</p>
        `
      );
    } catch (err) {
      console.warn("⚠️ Emaili nuk u dërgua:", err.message);
    }

    res.status(201).json({ message: "Mjeku u regjistrua me sukses." });
  } catch (err) {
    console.error("❌ Gabim gjatë regjistrimit të mjekut:", err);
    res.status(500).json({ message: "Gabim gjatë regjistrimit të mjekut." });
  }
});


// 🔑 Ndrysho fjalëkalimin e përdoruesit
router.put("/me/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Të dy fushat janë të detyrueshme." });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Fjalëkalimi aktual është i gabuar." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Fjalëkalimi u ndryshua me sukses." });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë ndryshimit të fjalëkalimit." });
  }
});
// ❌ Fshi llogarinë e përdoruesit
router.delete("/me", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Llogaria u fshi me sukses." });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë fshirjes së llogarisë." });
  }
});


module.exports = router;
