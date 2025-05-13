
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendEmail(to, subject, htmlContent) {
  const mailOptions = {
    from: `Absento <${process.env.MAIL_USER}>`,
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

async function sendInvitationEmail(user, token) {
  const link = `${process.env.LOCAL_URL}creer-mot-de-passe?token=${token}`;
  const subject = "Création de votre compte Absento";
  const htmlContent = `
    <p>Bonjour ${user.prenom} ${user.nom},</p>
    <p>Un compte vient d’être créé pour vous sur Absento.</p>
    <p>Pour activer votre compte et choisir votre mot de passe, cliquez sur ce lien :<br/>
    <a href="${link}">${link}</a></p>
    <p>Ce lien est valable 24h.</p>
    <p>Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p>
    <p>Cordialement,<br/>L’équipe Absento</p>
  `;
  await sendEmail(user.email, subject, htmlContent);
}

module.exports = { sendEmail, sendInvitationEmail };
