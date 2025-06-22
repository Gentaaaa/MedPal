// ✅ utils/generateReport.js
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

/**
 * Gjeneron një raport PDF për një termin dhe e ruan në /reports
 * @param {Object} appointment - objekti i terminit nga MongoDB
 * @returns {string} - path i PDF-it të gjeneruar
 */
function generatePDFReport(appointment) {
  const dir = path.join(__dirname, "../reports");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filename = `raport-${appointment._id}.pdf`;
  const filepath = path.join(dir, filename);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filepath));

  doc.fontSize(18).text("Raporti i Terminit", { align: "center" });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`🩺 Doktor: ${appointment.doctorId?.name || ""}`);
  doc.text(`🧑‍⚕️ Pacient: ${appointment.patientId?.name || ""}`);
  doc.text(`📧 Email: ${appointment.patientId?.email || ""}`);
  doc.text(`📅 Data: ${appointment.date}`);
  doc.text(`⏰ Ora: ${appointment.time}`);
  doc.text(`📌 Status: ${appointment.status}`);
  doc.end();

  return filepath;
}

module.exports = generatePDFReport;
