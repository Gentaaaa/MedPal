const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const VisitReport = require("../models/VisitReport");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const PDFDocument = require("pdfkit");

// ✅ POST /api/reports → ruaj raportin e vizitës
router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Vetëm mjekët mund të krijojnë raporte." });
  }

  try {
    const { appointmentId, diagnosis, recommendation, temperature, bloodPressure, symptoms } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Termini nuk u gjet." });

    const report = new VisitReport({
      appointmentId,
      doctorId: req.user.id,
      patientId: appointment.patientId,
      diagnosis,
      recommendation,
      temperature,
      bloodPressure,
      symptoms,
    });

    await report.save();

    const patient = await User.findById(appointment.patientId);
    const doctor = await User.findById(req.user.id);

    // 📧 Email te pacienti
    if (patient?.email) {
      try {
        await sendEmail(
          patient.email,
          "📋 Raporti i Vizitës është i gatshëm",
          `Përshëndetje ${patient.name},<br />Mjeku ka përfunduar raportin e vizitës suaj për datën ${appointment.date}. Ju mund ta shikoni ose shkarkoni në llogarinë tuaj.`
        );
      } catch (e) {
        console.warn("⚠️ Emaili nuk u dërgua te pacienti:", e.message);
      }
    }

    // 📧 Email te klinika
    if (doctor?.clinicId) {
      const clinic = await User.findById(doctor.clinicId);
      if (clinic?.email) {
        try {
          await sendEmail(
            clinic.email,
            "📋 Raport i ri vizite",
            `Mjeku ${doctor.name} ka përfunduar një raport të ri për pacientin ${patient.name} më ${appointment.date}.`
          );
        } catch (e) {
          console.warn("⚠️ Emaili nuk u dërgua te klinika:", e.message);
        }
      }
    }

    res.status(201).json({ message: "Raporti u ruajt me sukses.", report });
  } catch (err) {
    console.error("❌ Gabim gjatë ruajtjes së raportit:", err);
    res.status(500).json({ message: "Gabim në server." });
  }
});

// 📥 GET /api/reports/me → raportet e pacientit
router.get("/me", verifyToken, async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Vetëm pacientët kanë qasje." });
  }

  try {
    const reports = await VisitReport.find({ patientId: req.user.id })
      .populate("doctorId", "name")
      .populate("appointmentId", "date time");

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së raporteve." });
  }
});

// 📄 GET /api/reports/:id/pdf → gjenero PDF të raportit
router.get("/:id/pdf", verifyToken, async (req, res) => {
  try {
    const report = await VisitReport.findById(req.params.id)
      .populate("doctorId", "name")
      .populate("patientId", "name email dateOfBirth gender bloodType")
      .populate("appointmentId", "date time");

    if (!report) return res.status(404).json({ message: "Raporti nuk u gjet." });

    if (
      req.user.role !== "clinic" &&
      req.user.id !== report.patientId._id.toString() &&
      req.user.id !== report.doctorId._id.toString()
    ) {
      return res.status(403).json({ message: "Nuk keni qasje në këtë raport." });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Disposition", `attachment; filename=raporti-${report._id}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Titulli
    doc.fontSize(20).text("📋 Raporti i Vizitës Mjekësore", { align: "center" });
    doc.moveDown(2);

    const field = (label, value) => {
      doc.font("Helvetica-Bold").text(label, { continued: true });
      doc.font("Helvetica").text(` ${value || "N/A"}`);
    };

    const sectionTitle = (title) => {
      doc.moveDown().fontSize(14).fillColor("#333").text(title, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor("black");
    };

    sectionTitle("🧍‍♂️ Të dhënat e pacientit");
    field("👤 Emri:", report.patientId.name);
    field("📧 Email:", report.patientId.email);
    field("🎂 Datëlindja:", report.patientId.dateOfBirth);
    field("🧬 Gjinia:", report.patientId.gender);
    field("🩸 Grupi i gjakut:", report.patientId.bloodType);

    sectionTitle("📅 Detajet e vizitës");
    field("👨‍⚕️ Mjeku:", report.doctorId.name);
    field("📅 Data:", report.appointmentId.date);
    field("⏰ Ora:", report.appointmentId.time);

    sectionTitle("📝 Detaje të raportit mjekësor");
    field("Diagnoza:", report.diagnosis);
    field("Rekomandime:", report.recommendation);
    field("Simptoma:", report.symptoms);
    field("🌡️ Temperatura:", report.temperature);
    field("🩺 Tensioni:", report.bloodPressure);

    // Nënshkrimi
    doc.moveDown(3);
    doc.font("Helvetica-Oblique").text("____________________________", { align: "right" });
    doc.text(`Nënshkrimi i mjekut (${report.doctorId.name})`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error("❌ Gabim gjatë gjenerimit të PDF:", err);
    res.status(500).json({ message: "Gabim gjatë gjenerimit të raportit." });
  }
});


// 📋 GET /api/reports/clinic?from=2024-01-01&to=2024-12-31&doctorId=123
router.get("/clinic", verifyToken, async (req, res) => {
  if (req.user.role !== "clinic") {
    return res.status(403).json({ message: "Vetëm klinikat kanë qasje në këtë resurs." });
  }

  try {
    const { from, to, doctorId } = req.query;

    const doctorFilter = doctorId
      ? [doctorId]
      : (await User.find({ role: "doctor", clinicId: req.user.id }).select("_id")).map((d) => d._id);

    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    const reportQuery = {
      doctorId: { $in: doctorFilter },
    };
    if (from || to) {
      reportQuery.createdAt = dateFilter;
    }

    const reports = await VisitReport.find(reportQuery)
      .populate("doctorId", "name")
      .populate("appointmentId", "date time")
      .populate("patientId", "name email");

    res.json(reports);
  } catch (err) {
    console.error("❌ Gabim në filtrimin e raporteve:", err);
    res.status(500).json({ message: "Gabim gjatë marrjes së raporteve." });
  }
});
// 📋 GET /api/reports/doctor → Raportet e mjekut të kyçur
router.get("/doctor", verifyToken, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Vetëm mjekët kanë qasje." });
  }

  try {
    const reports = await VisitReport.find({ doctorId: req.user.id })
      .populate("patientId", "name email")
      .populate("appointmentId", "date time");

    res.json(reports);
  } catch (err) {
    console.error("❌ Gabim në /reports/doctor:", err);
    res.status(500).json({ message: "Gabim në server." });
  }
});

module.exports = router;
