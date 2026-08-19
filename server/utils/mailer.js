const nodemailer = require("nodemailer");

// Single shared transporter for all outgoing mail (OTP + password reset).
//
// Render (and most cloud hosts) frequently can't authenticate directly against
// smtp.gmail.com — Google flags datacenter IPs and silently drops/blocks the
// login. Brevo's SMTP relay works reliably from cloud IPs and is what this
// project has used successfully before, so it's the default here. Get free
// SMTP credentials at https://app.brevo.com/settings/keys/smtp and put the
// "SMTP login" in EMAIL_USER and the "SMTP key" in EMAIL_PASS.
//
// EMAIL_HOST/EMAIL_PORT can be overridden to point at any other SMTP
// provider (or back at Gmail) without touching this file.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// The "from" address must match (or be a verified sender/alias for) the
// authenticated EMAIL_USER account, or providers will reject/flag the send.
const FROM_NAME = "GITAM Academic Tracker";
const fromAddress = () =>
  `"${FROM_NAME}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;

/**
 * Send an email. Always await this and handle rejection — callers should
 * not respond "sent" to the client until this resolves.
 */
const sendMail = ({ to, subject, text, html }) =>
  transporter.sendMail({ from: fromAddress(), to, subject, text, html });

module.exports = { transporter, sendMail };
