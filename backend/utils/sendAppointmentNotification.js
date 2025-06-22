const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // ose zëvendëso me 'outlook', 'yahoo' etj. nëse përdor tjetër shërbim
  auth: {
    user: process.env.EMAIL_USER,     // p.sh. "yourclinic@gmail.com"
    pass: process.env.EMAIL_PASS      // gjeneruar nga Google App Passwords
  }
});

async function sendAppointmentNotification(to, subject, htmlContent) {
  const mailOptions = {
    from: `"MedPal Klinika" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendAppointmentNotification;
