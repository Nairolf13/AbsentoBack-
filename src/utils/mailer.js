// utils/mailer.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou ton service mail (Mailjet, SendGrid, etc.)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendEmail(to, subject, htmlContent) {
  const mailOptions = {
    from: `"Absento" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email envoyé à :", to);
  } catch (err) {
    console.error("Erreur envoi mail :", err);
  }
}

module.exports = { sendEmail };
