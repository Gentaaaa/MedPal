// /routes/appointments.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");
const Document = require("../models/Document");
const sendAppointmentNotification = require("../utils/sendAppointmentNotification");
const PDFDocument = require("pdfkit");

// POST /api/appointments
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
      time,
      status: "pending"
    });
    await newAppointment.save();

    const documents = await Document.find({ patientId: req.user.id });

    await sendAppointmentNotification(
      patient.email,
      "📅 Termini u rezervua",
      `Përshëndetje ${patient.name},<br />Keni rezervuar një takim te Dr. ${doctor.name} për shërbimin <strong>${service.name}</strong> më <strong>${date}</strong> në orën <strong>${time}</strong>.`
    );

    await sendAppointmentNotification(
      doctor.email,
      `📥 Termini i ri nga ${patient.name}`,
      `
        <p>Një pacient ka rezervuar një takim:</p>
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
            ? `<p><strong>📎 Dokumente të bashkangjitura:</strong></p><ul>` +
              documents.map(d => `<li><a href="http://localhost:5000${d.fileUrl}" target="_blank">${d.title}</a></li>`).join("") +
              `</ul>`
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
          <p>Një pacient ka rezervuar një takim:</p>
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
              ? `<p><strong>📎 Dokumente të bashkangjitura:</strong></p><ul>` +
                documents.map(d => `<li><a href="http://localhost:5000${d.fileUrl}" target="_blank">${d.title}</a></li>`).join("") +
                `</ul>`
              : `<p>❌ Nuk ka dokumente të bashkangjitura.</p>`
          }
        `
      );
    }

    res.status(201).json({ message: "Termini u ruajt me sukses!", appointment: newAppointment });
  } catch (err) {
    console.error("❌ Error në /appointments:", err);
    res.status(500).json({ message: "Gabim gjatë rezervimit." });
  }
});

// PUT /api/appointments/:id/status
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (req.user.role !== "clinic") {
      return res.status(403).json({ message: "Vetëm klinika mund të ndryshojë statusin." });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "email name")
      .populate("doctorId");

    if (!appointment) return res.status(404).json({ message: "Termini nuk u gjet." });

    if (!["pending", "approved", "canceled"].includes(status)) {
      return res.status(400).json({ message: "Status i pavlefshëm." });
    }

    if (status === "approved") {
      if (!appointment.doctorId || !appointment.doctorId.workingHours) {
        return res.status(400).json({ message: "Mungojnë të dhënat e mjekut ose orari i tij." });
      }

      const workingHours = appointment.doctorId.workingHours;
      const dayName = new Date(appointment.date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const schedule = workingHours[dayName];

      if (!schedule || appointment.time < schedule.start || appointment.time > schedule.end) {
        return res.status(400).json({
          message: `Ora është jashtë orarit të punës së mjekut (${schedule?.start || "?"} - ${schedule?.end || "?"})`
        });
      }
    }

    appointment.status = status;
    await appointment.save();

    if (["approved", "canceled"].includes(status)) {
      await sendAppointmentNotification(
        appointment.patientId.email,
        status === "approved" ? "✅ Termini u aprovua" : "❌ Termini u anullua",
        `Termini juaj te Dr. ${appointment.doctorId.name} më ${appointment.date} në orën ${appointment.time} është ${status === "approved" ? "aprovuar" : "anulluar"}.`
      );
    }

    res.json({ message: "Statusi u përditësua me sukses.", appointment });
  } catch (err) {
    console.error("❌ Error në PUT /:id/status:", err);
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});
// 📥 GET /api/appointments/mine
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate("doctorId", "name")
      .populate("serviceId", "name")
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së termineve." });
  }
});

// 👨‍⚕️ GET /api/appointments/doctor
// 👨‍⚕️ GET /api/appointments/doctor
router.get("/doctor", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Vetëm mjekët kanë qasje." });
    }

    const appointments = await Appointment.find({ doctorId: req.user.id, status: { $ne: "canceled" } })
      .populate("patientId", "name email")
      .populate("serviceId", "name time date")
      .sort({ date: -1 })
      .lean();

    // Për çdo takim, mund të shtojmë dokumentet dhe fushën isPresent
    for (let appt of appointments) {
      appt.documents = await Document.find({ appointmentId: appt._id }).lean();
    }

    res.json(appointments);
  } catch (err) {
    console.error("❌ Error në /appointments/doctor:", err);
    res.status(500).json({ message: "Gabim gjatë marrjes së termineve." });
  }
});

// ⛔ GET /api/appointments/taken
router.get("/taken", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ message: "doctorId dhe date janë të detyrueshme." });

    const appointments = await Appointment.find({ doctorId, date, status: { $ne: "canceled" } });
    const times = appointments.map((a) => a.time);
    res.json(times);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë kontrollit të orëve të zëna." });
  }
});

// 📄 GET /api/appointments/:id/pdf
router.get("/:id/pdf", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "name")
      .populate("patientId", "name email")
      .populate("serviceId", "name price");

    if (!appointment) return res.status(404).json({ message: "Termini nuk u gjet." });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="raport-${appointment._id}.pdf"`);

    doc.pipe(res);
    doc.fontSize(18).text("📄 Raporti i Terminit", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`🧑‍⚕️ Doktor: ${appointment.doctorId.name}`);
    doc.text(`🧑‍💼 Pacient: ${appointment.patientId.name}`);
    doc.text(`📧 Email: ${appointment.patientId.email}`);
    doc.text(`💉 Shërbimi: ${appointment.serviceId.name}`);
    doc.text(`💰 Çmimi: ${appointment.serviceId.price} €`);
    doc.text(`📅 Data: ${appointment.date}`);
    doc.text(`⏰ Ora: ${appointment.time}`);
    doc.text(`📌 Statusi: ${appointment.status}`);
    doc.end();
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë gjenerimit të raportit." });
  }
});

// 📅 GET /api/appointments/all (për klinikë)
router.get("/all", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "clinic") {
      return res.status(403).json({ message: "Vetëm klinika ka qasje." });
    }

    // Gjej të gjithë mjekët që i përkasin kësaj klinike
    const doctors = await User.find({ role: "doctor", clinicId: req.user.id });
    const doctorIds = doctors.map((d) => d._id);

    // Gjej të gjithë terminet që i përkasin këtyre mjekëve
    const appointments = await Appointment.find({ doctorId: { $in: doctorIds } })
      .populate("patientId", "name email dateOfBirth")
      .populate("doctorId", "name")
      .lean();

    // Merr dokumentet për çdo pacient në këto termine
   for (const a of appointments) {
  if (a.patientId && a.patientId._id) {
    a.documents = await Document.find({ patientId: a.patientId._id });
  } else {
    a.documents = [];
  }
}


    res.json(appointments);
  } catch (err) {
    console.error("❌ Gabim në /appointments/all:", err);
    res.status(500).json({ message: "Gabim gjatë marrjes së termineve." });
  }
});


// PUT /api/appointments/mark-seen
router.put("/mark-seen", verifyToken, async (req, res) => {
  try {
    await Appointment.updateMany(
      { patientId: req.user.id, seenByPatient: false },
      { $set: { seenByPatient: true } }
    );
    res.json({ message: "Të gjitha njoftimet u shënuan si të lexuara." });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});

// GET /api/appointments/unseen-count
router.get("/unseen-count", verifyToken, async (req, res) => {
  try {
    const count = await Appointment.countDocuments({
      patientId: req.user.id,
      seenByPatient: false,
      status: { $in: ["approved", "canceled"] },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së njoftimeve." });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Termini nuk u gjet." });
    }

    // Vetëm pacienti që e ka rezervuar ose mjeku i caktuar mund ta fshijë
    if (
      req.user.role === "patient" && appointment.patientId.toString() !== req.user.id ||
      req.user.role === "doctor" && appointment.doctorId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Nuk jeni të autorizuar për këtë veprim." });
    }

    await appointment.deleteOne();
    res.json({ message: "Termini u fshi me sukses." });
  } catch (err) {
    console.error("❌ Error deleting appointment:", err);
    res.status(500).json({ message: "Gabim gjatë fshirjes së terminit." });
  }
});

// ✅ PUT /api/appointments/:id/attended - shëno si prezencë
router.put("/:id/attended", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Termini nuk u gjet." });
    }

    // Lejohet vetëm nga mjeku ose klinika
    if (
      (req.user.role === "doctor" && appointment.doctorId.toString() !== req.user.id) ||
      (req.user.role === "clinic" && appointment.doctorId.clinicId?.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: "Nuk jeni të autorizuar për këtë veprim." });
    }

    appointment.attended = true;
    await appointment.save();
    res.json({ message: "✅ Termini u shënua si i kryer me sukses." });
  } catch (err) {
    console.error("❌ Error në PUT /:id/attended:", err);
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Termini nuk u gjet." });
    }

    // opsional: kontrollo që useri ka të drejtë me fshi
    if (
      req.user.role !== "clinic" &&
      req.user.role !== "doctor" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Nuk keni autorizim për të fshirë këtë termin." });
    }

    await appointment.deleteOne();
    res.json({ message: "Termini u fshi me sukses." });
  } catch (err) {
    console.error("❌ Gabim gjatë fshirjes së terminit:", err);
    res.status(500).json({ message: "Gabim në server." });
  }
});

module.exports = router;
