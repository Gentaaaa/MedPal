const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/verifyToken");
const Document = require("../models/Document");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  }
});

const upload = multer({ storage });

// 📤 POST /api/documents/upload
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { title } = req.body;
    const fileUrl = "/uploads/" + req.file.filename;

    const doc = new Document({
      patientId: req.user.id,
      title,
      fileUrl
    });

    await doc.save();
    res.status(201).json({ message: "Dokumenti u ngarkua me sukses.", document: doc });
  } catch (err) {
    console.error("❌ Gabim në upload:", err);
    res.status(500).json({ message: "Gabim gjatë ngarkimit të dokumentit." });
  }
});

// 📥 GET /api/documents/mine
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const documents = await Document.find({ patientId: req.user.id });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së dokumenteve." });
  }
});
// backend/routes/documents.js (shto këtë endpoint)

router.post(
  "/upload/:appointmentId",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const { title } = req.body;
      const fileUrl = "/uploads/" + req.file.filename;

      const doc = new Document({
        title,
        fileUrl,
        patientId: req.user.role === "doctor" ? req.body.patientId : req.user.id,
        doctorId: req.user.role === "doctor" ? req.user.id : null,
        appointmentId: req.params.appointmentId,
      });

      await doc.save();
      res.status(201).json({ message: "Dokumenti u ngarkua me sukses.", document: doc });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Gabim gjatë ngarkimit." });
    }
  }
);
// 📤 POST /api/documents/upload/:appointmentId
router.post("/upload/:appointmentId", verifyToken, upload.single("file"), async (req, res) => {
  const { title } = req.body;
  const fileUrl = "/uploads/" + req.file.filename;

  const document = new Document({
    title,
    fileUrl,
    patientId: req.user.id, // ose merre nga appointment.patientId
    appointmentId: req.params.appointmentId,
    doctorId: req.user.id,
  });

  await document.save();

  await Appointment.findByIdAndUpdate(req.params.appointmentId, {
    $push: { documents: document._id },
  });

  res.status(201).json({ message: "Dokumenti u ngarkua me sukses", document });
});



module.exports = router;
