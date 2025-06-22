const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/verifyToken");
const Document = require("../models/Document");
const Appointment = require("../models/Appointment");

// Konfigurimi për ruajtjen e file-ave
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, unique);
  },
});
const upload = multer({ storage });

/* ===============================
   📄 GET /api/documents/mine
   Kthen dokumentet e pacientit të kyçur
================================ */
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const documents = await Document.find({ patientId: req.user.id });
    res.json(documents);
  } catch (err) {
    console.error("❌ Gabim në marrje:", err);
    res.status(500).json({ message: "Gabim gjatë marrjes së dokumenteve." });
  }
});

/* ===============================
   📤 POST /api/documents/upload/:appointmentId
   Upload dokument me ID të appointment-it (nga pacient ose doktor)
================================ */
router.post("/upload/:appointmentId", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { title, patientId } = req.body;
    const fileUrl = "/uploads/" + req.file.filename;

    const document = new Document({
      title,
      fileUrl,
      appointmentId: req.params.appointmentId,
      patientId: req.user.role === "doctor" ? patientId : req.user.id,
      doctorId: req.user.role === "doctor" ? req.user.id : null,
    });

    await document.save();

    await Appointment.findByIdAndUpdate(req.params.appointmentId, {
      $push: { documents: document._id },
    });

    res.status(201).json({ message: "📎 Dokumenti u ngarkua me sukses", document });
  } catch (err) {
    console.error("❌ Error uploading with appointmentId:", err);
    res.status(500).json({ message: "Gabim gjatë ngarkimit." });
  }
});

/* ===============================
   📤 POST /api/documents/upload
   Upload pa appointmentId (vetëm pacienti)
================================ */
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Vetëm pacienti mund të ngarkojë pa takim." });
    }

    const { title } = req.body;
    const fileUrl = "/uploads/" + req.file.filename;

    const doc = new Document({
      title,
      fileUrl,
      patientId: req.user.id,
    });

    await doc.save();
    res.status(201).json({ message: "📎 Dokumenti u ngarkua me sukses", document: doc });
  } catch (err) {
    console.error("❌ Error uploading without appointmentId:", err);
    res.status(500).json({ message: "Gabim gjatë ngarkimit." });
  }
});
// PUT /api/documents/:id
router.put("/:id", verifyToken, async (req, res) => {
  const { title } = req.body;
  try {
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user.id },
      { title },
      { new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});

// DELETE /api/documents/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({
      _id: req.params.id,
      patientId: req.user.id,
    });
    res.json({ message: "Dokumenti u fshi me sukses." });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë fshirjes." });
  }
});

module.exports = router;
