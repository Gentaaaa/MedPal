const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

/**
 * Gjeneron një raport PDF mjekësor për një termin dhe e ruan në /reports
 * @param {Object} appointment - objekti i terminit nga MongoDB
 * @returns {string} - path i PDF-it të gjeneruar
 */
function generatePDFReport(appointment) {
  const dir = path.join(__dirname, "../reports");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filename = `raport-${appointment._id}.pdf`;
  const filepath = path.join(dir, filename);

  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(fs.createWriteStream(filepath));

  // Header
  doc
    .fontSize(20)
    .text("🧾 Raport Mjekësor", { align: "center", underline: true });
  doc.moveDown(1);

  // Info Doktorit
  doc
    .fontSize(14)
    .fillColor("#000")
    .text("📋 Informacione mbi vizitën", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`👨‍⚕️ Doktor: ${appointment.doctorId?.name || "N/A"}`);
  doc.text(`🏥 Klinika: ${appointment.doctorId?.clinicName || "N/A"}`);
  doc.text(`📅 Data & Ora: ${appointment.date} në ${appointment.time}`);
  doc.text(`📝 Statusi i Terminit: ${appointment.status}`);
  doc.moveDown(1);

  // Info Pacientit
  doc
    .fontSize(14)
    .text("🧑‍💼 Informacione të pacientit", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`👤 Emri: ${appointment.patientId?.name || "N/A"}`);
  doc.text(`📧 Email: ${appointment.patientId?.email || "N/A"}`);
  doc.text(`🎂 Data e lindjes: ${appointment.patientId?.dateOfBirth || "N/A"}`);
  doc.moveDown(1);

  // Sherbimi
  doc
    .fontSize(14)
    .text("💉 Shërbimi i kryer", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`🩺 Shërbimi: ${appointment.serviceId?.name || "N/A"}`);
  if (appointment.notes) {
    doc.text(`🗒️ Shënime nga mjeku: ${appointment.notes}`);
  }

  // Footer me datë dhe firmë
  doc.moveDown(3);
  const currentDate = new Date().toLocaleDateString("sq-AL");
  doc.text(`📆 Raporti u gjenerua më: ${currentDate}`, { align: "left" });
  doc.moveDown(2);
  doc.text("_____________________", { align: "right" });
  doc.text("Nënshkrimi i mjekut", { align: "right" });

  doc.end();

  return filepath;
}

module.exports = generatePDFReport;
