const nodemailer = require("nodemailer");
const dns = require("dns").promises;

// Two ways to send mail, switchable with one env var so no code change is
// needed when Brevo gets reinstated:
//
//   MAIL_PROVIDER=gmail  -> Gmail SMTP (needs EMAIL_USER = a real @gmail.com
//                           address, EMAIL_PASS = its 16-char App Password
//                           from Google Account -> Security -> App passwords)
//   anything else/unset  -> Brevo HTTPS API (default; needs BREVO_API_KEY
//                           and EMAIL_FROM, a verified Brevo sender)
//
// Brevo was chosen as the default because it's what this project's history
// shows working previously and it sidesteps SMTP-port blocking (HTTPS on
// port 443 instead). Gmail exists as a fallback for when a Brevo account is
// suspended/unverified and sending needs to work immediately.
const FROM_NAME = "GITAM Academic Tracker";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const GMAIL_HOST = "smtp.gmail.com";

const sendViaGmail = async ({ to, subject, text, html }) => {
  // This host has no IPv6 route. smtp.gmail.com is dual-stack, and neither
  // family:4 nor a global dns.setDefaultResultOrder("ipv4first") stopped
  // Node from picking its IPv6 address here (still failed with
  // ENETUNREACH) -- some layer along the way must be requesting addresses
  // with `verbatim` set, which bypasses that default. So: resolve the A
  // (IPv4-only) record ourselves and connect to that literal address,
  // removing the ambiguity entirely. `tls.servername` keeps TLS certificate
  // validation working against the real hostname despite connecting by IP.
  let connectHost = GMAIL_HOST;
  try {
    const addresses = await dns.resolve4(GMAIL_HOST);
    if (addresses.length) connectHost = addresses[0];
  } catch (err) {
    console.warn("Could not resolve IPv4 address for smtp.gmail.com, falling back to hostname:", err.message);
  }

  const transporter = nodemailer.createTransport({
    host: connectHost,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: { servername: GMAIL_HOST },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });

  const info = await transporter.sendMail({
    from: `"${FROM_NAME}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    ...(html ? { html } : {})
  });

  return { messageId: info.messageId || info.response };
};

const sendViaBrevoApi = async ({ to, subject, text, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey) throw new Error("BREVO_API_KEY is not set");
  if (!fromEmail) throw new Error("EMAIL_FROM is not set");

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: fromEmail },
      to: [{ email: to }],
      subject,
      textContent: text,
      ...(html ? { htmlContent: html } : {})
    })
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`Brevo API error ${res.status}: ${body.message || JSON.stringify(body)}`);
  }

  return body; // { messageId: "..." }
};

const sendMail = (opts) =>
  process.env.MAIL_PROVIDER === "gmail" ? sendViaGmail(opts) : sendViaBrevoApi(opts);

module.exports = { sendMail };
