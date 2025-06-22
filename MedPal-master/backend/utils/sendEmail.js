const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Dërgon email për verifikim, ftesë nga klinika ose reset të fjalëkalimit
 */
async function sendVerificationEmail(to, code, link = null, name = null, clinicName = null, isReset = false) {
  if (!to || !code) throw new Error("Email ose kodi mungon");

  let subject = "📧 Verifikimi i Emailit";
  let html = `
    <p>Përshëndetje 👋,</p>
    <p>Kodi juaj për verifikim është: <strong>${code}</strong></p>
    <p>Faleminderit që u regjistruat në <b>MedPal</b>.</p>
  `;

  if (link && clinicName && name) {
    subject = `📩 Ftesë nga Klinika ${clinicName} për MedPal`;
    html = `
      <p>Përshëndetje ${name},</p>
      <p>Klinika <strong>${clinicName}</strong> ju ka ftuar të regjistroheni në platformën MedPal.</p>
      <p>Kodi juaj i verifikimit është: <strong>${code}</strong></p>
      <p>
        <a href="${link}" style="display:inline-block;background-color:#28a745;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">
          Kliko këtu për të verifikuar llogarinë
        </a>
      </p>
    `;
  } else if (isReset) {
    subject = "🔐 Kodi për Ndërrim Fjalëkalimi";
    html = `
      <p>Përshëndetje,</p>
      <p>Ju keni kërkuar të ndryshoni fjalëkalimin në MedPal.</p>
      <p>Kodi për të vazhduar është: <strong>${code}</strong></p>
      <p>Fusni këtë kod në aplikacion për të vendosur fjalëkalimin e ri.</p>
    `;
  }

  const mailOptions = {
    from: `"MedPal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: html + footer(),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email dërguar te ${to} për: ${subject}`);
  } catch (error) {
    console.error("❌ Gabim gjatë dërgimit të emailit:", error);
    throw new Error("Dështoi dërgimi i emailit.");
  }
}

/**
 * Dërgon email mirëseardhje për mjekun me kredencialet
 */
async function sendDoctorWelcomeEmail(email, doctorCode, password) {
  if (!email || !doctorCode || !password) throw new Error("Të dhënat për doktorin janë jo të plota");

  const mailOptions = {
    from: `"MedPal Klinika" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "👨‍⚕️ Llogaria juaj në MedPal",
    html: `
      <h2>Përshëndetje Doktor,</h2>
      <p>Jeni regjistruar me sukses në platformën MedPal.</p>
      <p><strong>Doctor Code:</strong> ${doctorCode}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Mund të kyçeni këtu: <a href="${process.env.CLIENT_URL}/login-doctor">Login Doctor</a></p>
      ${footer()}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email mirëseardhje për mjekun u dërgua te ${email}`);
  } catch (error) {
    console.error("❌ Gabim gjatë dërgimit të emailit për mjekun:", error);
    throw new Error("Dështoi dërgimi i emailit për mjekun.");
  }
}

/**
 * Email i përgjithshëm
 */
async function sendGeneralEmail(to, subject, htmlContent) {
  const mailOptions = {
    from: `"MedPal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `${htmlContent}${footer()}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email u dërgua te ${to} me titullin: ${subject}`);
  } catch (err) {
    console.error("❌ Gabim gjatë dërgimit të emailit të përgjithshëm:", err);
    throw new Error("Gabim gjatë dërgimit të emailit.");
  }
}

function footer() {
  return `
    <hr />
    <p style="font-size: 12px; color: #777;">
      Ky është një email automatik nga platforma MedPal. Ju lutem mos e përgjigjni këtë mesazh.
    </p>
  `;
}

module.exports = {
  sendVerificationEmail,
  sendDoctorWelcomeEmail,
  sendGeneralEmail,
};
