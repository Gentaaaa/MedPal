const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/verifyToken");
const Document = require("../models/Document");
const Appointment = require("../models/Appointment");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, unique);
  }
});

const upload = multer({ storage });

// 📥 GET /api/documents/mine
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const documents = await Document.find({ patientId: req.user.id });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së dokumenteve." });
  }
});

// 📤 POST /api/documents/upload/:appointmentId
router.post("/upload/:appointmentId", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { title } = req.body;
    const fileUrl = "/uploads/" + req.file.filename;

    const document = new Document({
      title,
      fileUrl,
      patientId: req.user.role === "doctor" ? req.body.patientId : req.user.id,
      doctorId: req.user.role === "doctor" ? req.user.id : null,
      appointmentId: req.params.appointmentId,
    });

    await document.save();

    await Appointment.findByIdAndUpdate(req.params.appointmentId, {
      $push: { documents: document._id },
    });

    res.status(201).json({ message: "Dokumenti u ngarkua me sukses", document });
  } catch (err) {
    console.error("❌ Error uploading document:", err);
    res.status(500).json({ message: "Gabim gjatë ngarkimit." });
  }
});

module.exports = router;
