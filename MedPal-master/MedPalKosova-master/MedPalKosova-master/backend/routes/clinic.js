const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const Department = require("../models/Department");
const Service = require("../models/Service");
const User = require("../models/User");

// ==========================
// 📁 DEPARTAMENTET
// ==========================

// ➕ Shto departament (vetëm klinika)
router.post("/departments", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinika mund të shtojë departamente." });
  }

  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Emri i departamentit është i detyrueshëm." });

  try {
    const newDepartment = new Department({ name, clinicId: req.user.id });
    await newDepartment.save();
    res.status(201).json(newDepartment);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë shtimit të departamentit." });
  }
});

// 📥 Merr të gjithë departamentet e klinikës
router.get("/departments", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinika ka qasje në këtë." });
  }

  try {
    const departments = await Department.find({ clinicId: req.user.id });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së departamenteve." });
  }
});

// ==========================
// 👨‍⚕️ MJEKËT
// ==========================

// 📋 Merr të gjithë mjekët e klinikës
router.get("/doctors", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinika ka qasje në këtë." });
  }

  try {
    const doctors = await User.find({ role: "doctor", clinicId: req.user.id })
      .select("-password")
      .populate("departmentId", "name")
      .populate("services", "name price");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së mjekëve." });
  }
});

// ==========================
// 💊 SHËRBIMET
// ==========================

// ➕ Shto shërbim të ri për një departament (vetëm klinika)
router.post("/services", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinika mund të shtojë shërbime." });
  }

  const { name, departmentId, price } = req.body;

  if (!name || !departmentId) {
    return res.status(400).json({ message: "Emri dhe departamenti janë të detyrueshëm." });
  }

  try {
    const newService = new Service({ name, departmentId, price });
    await newService.save();
    res.status(201).json({ message: "✅ Shërbimi u shtua me sukses!", service: newService });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë shtimit të shërbimit." });
  }
});

// 📋 Merr të gjitha shërbimet e klinikës (bazuar në departamentet e saj)
router.get("/services", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinika ka qasje në këtë." });
  }

  try {
    const departments = await Department.find({ clinicId: req.user.id }).select("_id");
    const departmentIds = departments.map((d) => d._id);
    const services = await Service.find({ departmentId: { $in: departmentIds } })
      .populate("departmentId", "name");
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së shërbimeve." });
  }
});
// DELETE department
router.delete("/departments/:id", verifyToken, async (req, res) => {
  try {
    await Department.findOneAndDelete({ _id: req.params.id, clinicId: req.user.id });
    res.json({ message: "Departamenti u fshi me sukses." });
  } catch {
    res.status(500).json({ message: "Gabim gjatë fshirjes së departamentit." });
  }
});

// DELETE service
router.delete("/services/:id", verifyToken, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Shërbimi u fshi me sukses." });
  } catch {
    res.status(500).json({ message: "Gabim gjatë fshirjes së shërbimit." });
  }
});

// PUT update service
router.put("/services/:id", verifyToken, async (req, res) => {
  const { name, price, departmentId } = req.body;
  try {
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { name, price, departmentId },
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Gabim gjatë përditësimit të shërbimit." });
  }
});

// 🔁 Përditëso të dhënat e një mjeku (departament/shërbime)
router.put("/doctors/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinikat mund të ndryshojnë mjekë." });
  }

  const { departmentId, services } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { departmentId, services },
      { new: true }
    ).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë përditësimit të mjekut." });
  }
});

// 🗑️ Fshij mjek
router.delete("/doctors/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinikat mund të fshijnë mjekë." });
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Mjeku u fshi me sukses." });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë fshirjes së mjekut." });
  }
});
// 📥 Merr të gjitha shërbimet publike
router.get("/services/public", async (req, res) => {
  try {
    const services = await Service.find().populate("departmentId", "name");
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së shërbimeve." });
  }
});
// GET /api/clinic/doctors → mjekët e klinikës së kyçur
router.get("/doctors", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinikat kanë qasje." });
  }

  const doctors = await User.find({ clinicId: req.user.id, role: "doctor" }).select("name _id");
  res.json(doctors);
});
// Përditëso emrin/emailin e mjekut
router.put("/users/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinikat mund të ndryshojnë të dhënat." });
  }

  const { name, email } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    ).select("-password");
    res.json(updated);
  } catch (err) {
    console.error("❌ Gabim gjatë përditësimit të mjekut:", err);
    res.status(500).json({ message: "Gabim gjatë përditësimit të mjekut." });
  }
});

// ✏️ PUT /api/clinic/update → Përditëso profilin e klinikës
router.put("/update", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "clinic") {
      return res.status(403).json({ message: "Vetëm klinika mund të përditësojë këtë profil." });
    }

    const { name, email, password } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateFields.password = hashed;
    }

    const updated = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true }).select("-password");
    res.json({ message: "Profili u përditësua me sukses!", clinic: updated });
  } catch (err) {
    console.error("❌ Gabim gjatë përditësimit të klinikës:", err);
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});

module.exports = router;
