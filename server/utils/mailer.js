// Sends mail via Brevo's HTTPS transactional-email API instead of raw SMTP.
//
// SMTP (ports 587/465) kept hanging until timeout on this host regardless of
// port — a common failure mode when a network path blocks/drops outbound
// SMTP but leaves normal HTTPS untouched. The API call below is a plain
// HTTPS POST on port 443, the same port everything else on this app already
// uses successfully, so it isn't subject to that class of problem.
//
// Needs BREVO_API_KEY (Settings -> SMTP & API -> API Keys tab in Brevo,
// "Generate a new API key" -- a different key from the SMTP login/key pair)
// and EMAIL_FROM (a verified sender in Brevo).
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const FROM_NAME = "GITAM Academic Tracker";

const sendMail = async ({ to, subject, text, html }) => {
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

module.exports = { sendMail };
