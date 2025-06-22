const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");
const Document = require("../models/Document");
const sendAppointmentNotification = require("../utils/sendAppointmentNotification");
const PDFDocument = require("pdfkit");

// ✅ POST /api/appointments
router.post("/", verifyToken, async (req, res) => {
  try {
    const { doctorId, serviceId, date, time } = req.body;
    if (!doctorId || !serviceId || !date || !time)
      return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });

    const doctor = await User.findById(doctorId);
    const service = await Service.findById(serviceId);
    const patient = await User.findById(req.user.id).select("-password");

    if (!doctor || doctor.role !== "doctor")
      return res.status(404).json({ message: "Mjeku nuk u gjet." });

    if (!service) return res.status(404).json({ message: "Shërbimi nuk u gjet." });

    const workingHours = doctor.workingHours;
    if (!workingHours) return res.status(400).json({ message: "Mjeku nuk ka orar të caktuar." });

    const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const daySchedule = workingHours[dayName];
    if (!daySchedule || !daySchedule.start || !daySchedule.end)
      return res.status(400).json({ message: `Mjeku nuk punon të ${dayName}.` });

    if (time < daySchedule.start || time > daySchedule.end)
      return res.status(400).json({ message: `Orari i mjekut është nga ${daySchedule.start} deri në ${daySchedule.end}.` });

    const existing = await Appointment.findOne({ doctorId, date, time, status: { $ne: "canceled" } });
    if (existing) return res.status(409).json({ message: "Ky orar është i zënë për këtë mjek." });

    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId: doctor._id,
      serviceId: service._id,
      date,
      time
    });
    await newAppointment.save();

    const documents = await Document.find({ patientId: req.user.id });
    const baseUrl = process.env.BASE_URL || "https://medpal-aqpz.onrender.com";

    await sendAppointmentNotification(
      patient.email,
      "📅 Termini u rezervua",
      `Përshëndetje ${patient.name},<br />Keni rezervuar një takim te Dr. ${doctor.name} për shërbimin <strong>${service.name}</strong> më <strong>${date}</strong> në orën <strong>${time}</strong>.`
    );

    await sendAppointmentNotification(
      doctor.email,
      `📥 Termini i ri nga ${patient.name}`,
      `
        <ul>
          <li><strong>Pacient:</strong> ${patient.name}</li>
          <li><strong>Email:</strong> ${patient.email}</li>
          <li><strong>Data e lindjes:</strong> ${patient.dateOfBirth || "N/A"}</li>
          <li><strong>Shërbimi:</strong> ${service.name}</li>
          <li><strong>Data:</strong> ${date}</li>
          <li><strong>Ora:</strong> ${time}</li>
        </ul>
        ${
          documents.length
            ? `<ul>` + documents.map(d => `<li><a href="${baseUrl}${d.fileUrl}" target="_blank">${d.title}</a></li>`).join("") + `</ul>`
            : `<p>❌ Nuk ka dokumente të bashkangjitura.</p>`
        }
      `
    );

    const clinic = await User.findById(doctor.clinicId);
    if (clinic) {
      await sendAppointmentNotification(
        clinic.email,
        `📥 Termini i ri për Dr. ${doctor.name}`,
        `
          <ul>
            <li><strong>Pacient:</strong> ${patient.name}</li>
            <li><strong>Email:</strong> ${patient.email}</li>
            <li><strong>Data e lindjes:</strong> ${patient.dateOfBirth || "N/A"}</li>
            <li><strong>Shërbimi:</strong> ${service.name}</li>
            <li><strong>Data:</strong> ${date}</li>
            <li><strong>Ora:</strong> ${time}</li>
          </ul>
        `
      );
    }

    res.status(201).json({ message: "Termini u ruajt me sukses!", appointment: newAppointment });
  } catch (err) {
    console.error("❌ Error në POST /appointments:", err);
    res.status(500).json({ message: "Gabim gjatë rezervimit." });
  }
});

// ✅ PUT /api/appointments/:id/status
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (req.user.role !== "clinic") return res.status(403).json({ message: "Vetëm klinika mund të ndryshojë statusin." });

    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "email name")
      .populate("doctorId");

    if (!appointment) return res.status(404).json({ message: "Termini nuk u gjet." });

    appointment.status = status;
    await appointment.save();

    if (["approved", "canceled"].includes(status)) {
      await sendAppointmentNotification(
        appointment.patientId.email,
        status === "approved" ? "✅ Termini u aprovua" : "❌ Termini u anullua",
        `Termini juaj te Dr. ${appointment.doctorId.name} më ${appointment.date} në orën ${appointment.time} është ${status}.`
      );
    }

    res.json({ message: "Statusi u përditësua me sukses.", appointment });
  } catch (err) {
    console.error("❌ Error në PUT /:id/status:", err);
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});

// ✅ GET /mine
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate("doctorId", "name")
      .populate("serviceId", "name")
      .sort({ date: -1, time: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së termineve." });
  }
});

// ✅ GET /doctor
router.get("/doctor", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ message: "Vetëm mjekët kanë qasje." });

    const appointments = await Appointment.find({ doctorId: req.user.id, status: { $ne: "canceled" } })
      .populate("patientId", "name email")
      .populate("serviceId", "name")
      .sort({ date: -1, time: -1 })
      .lean();

    for (let a of appointments) {
      a.documents = await Document.find({ appointmentId: a._id }).lean();
    }

    res.json(appointments);
  } catch (err) {
    console.error("❌ Error në /appointments/doctor:", err);
    res.status(500).json({ message: "Gabim gjatë marrjes së termineve." });
  }
});

// ✅ DELETE /:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Termini nuk u gjet." });

    const isOwner =
      (req.user.role === "patient" && appointment.patientId.toString() === req.user.id) ||
      (req.user.role === "doctor" && appointment.doctorId.toString() === req.user.id) ||
      (req.user.role === "clinic" || req.user.role === "admin");

    if (!isOwner) return res.status(403).json({ message: "Nuk jeni të autorizuar për këtë veprim." });

    await appointment.deleteOne();
    res.json({ message: "Termini u fshi me sukses." });
  } catch (err) {
    console.error("❌ Error në DELETE /:id:", err);
    res.status(500).json({ message: "Gabim gjatë fshirjes së terminit." });
  }
});

// ✅ PUT /:id/presence
router.put("/:id/presence", verifyToken, async (req, res) => {
  try {
    const { isPresent } = req.body;
    if (typeof isPresent !== "boolean") return res.status(400).json({ message: "isPresent duhet të jetë boolean." });

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { isPresent }, { new: true });
    if (!appointment) return res.status(404).json({ message: "Termini nuk u gjet." });

    res.json({ message: "Prezenca u përditësua me sukses.", appointment });
  } catch (err) {
    console.error("❌ Error në PUT /:id/presence:", err);
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});

module.exports = router;
