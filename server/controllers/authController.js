const crypto = require("crypto");
const User = require("../models/User");
const OTP = require("../models/OTP");
const PasswordReset = require("../models/PasswordReset");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../models/Token");
const { sendMail } = require("../utils/mailer");

// ================= EMAIL VALIDATION =================
const allowedDomains = [
  "@gmail.com"
];

const isValidGitamEmail = (email) => {
  return allowedDomains.some(domain =>
    email.toLowerCase().endsWith(domain)
  );
};

// ================= PASSWORD VALIDATION =================
const isStrongPassword = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// ================= TOKEN =================
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "2h"
  });
};
// ================= SEND OTP =================
exports.sendOtp = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    

    if (!isValidGitamEmail(email)) {
      return res.status(400).json({
        msg: "Only gmail are allowed"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndDelete({ email });

    await OTP.create({
      email,
      otp,
      expires: Date.now() + 600000
    });

    try {
      const info = await sendMail({
        to: email,
        subject: "OTP Verification - Academic Tracker",
        text: `Your OTP is: ${otp}`
      });

      console.log("EMAIL SENT:", info.messageId || info);

      res.json({ msg: "OTP sent successfully" });

    } catch (err) {
      console.error("EMAIL ERROR:", err);

      return res.status(500).json({
        msg: "Failed to send OTP"
      });
    }

  } catch (err) {
    console.error("ERROR:", err);

    res.status(500).json({
      msg: "Failed to send OTP",
      error: err.message
    });
  }
};
// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const otpVal = req.body.otp;

  const record = await OTP.findOne({ email }).sort({ createdAt: -1 });

  if (!record) return res.status(400).json({ msg: "Invalid OTP" });
  
  if (record.otp !== otpVal.toString())
    return res.status(400).json({ msg: "Incorrect OTP" });
  
  if (Date.now() > record.expires)
    return res.status(400).json({ msg: "OTP expired" });



  res.json({ msg: "OTP verified" });
};
// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
const {
  password,
  confirmPassword,
  name,
  regNo,
  branch,
  batch,
  phone,
  otp
} = req.body;

    if (!isValidGitamEmail(email)) {
      return res.status(400).json({
        msg: "Only gmail.com are allowed"
      });
    }

    if (!email || !password || !confirmPassword || !name || !regNo || !branch || !batch) {
      return res.status(400).json({ msg: "All required fields must be filled" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // 🔐 Password strength check
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      });
    }

    const record = await OTP.findOne({
      email,
      otp: otp?.toString()
    });

    if (!record) return res.status(400).json({ msg: "OTP not verified" });

    if (Date.now() > record.expires)
      return res.status(400).json({ msg: "OTP expired" });

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      password: hashed,
      regNo,
      branch,
      batch,
      phone: phone || ""
    });

    await OTP.findOneAndDelete({ email });

    const token = generateToken(user);

    const { password: _, ...safeUser } = user._doc;

    res.json({ token, user: safeUser });

  } catch (err) {
    res.status(500).json({ msg: "Signup failed" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const email = req.body.email.toLowerCase();
const { password } = req.body;
  if (!isValidGitamEmail(email)) {
    return res.status(400).json({
      msg: "Only gmail.com are allowed"
    });
  }

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ msg: "User not found" });

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) return res.status(400).json({ msg: "Wrong password" });

  const token = generateToken(user);

  const { password: _, ...safeUser } = user._doc;

  res.json({ token, user: safeUser });
};

// ================= FORGOT PASSWORD (send reset link) =================
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const resetBaseUrl = () =>
  (process.env.CLIENT_URL ||
    (process.env.CLIENT_ORIGIN || "http://localhost:3000").split(",")[0].trim());

exports.forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase();

    if (!isValidGitamEmail(email)) {
      return res.status(400).json({ msg: "Only gmail.com are allowed" });
    }

    // Always return the same response whether or not the account exists,
    // so this endpoint can't be used to enumerate registered emails.
    const genericMsg = "If an account exists for that email, a reset link has been sent.";

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ msg: genericMsg });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    await PasswordReset.deleteMany({ email });
    await PasswordReset.create({
      email,
      tokenHash: hashToken(rawToken),
      expires: new Date(Date.now() + RESET_TOKEN_TTL_MS)
    });

    const resetLink = `${resetBaseUrl()}/reset-password?token=${rawToken}`;

    try {
      const info = await sendMail({
        to: email,
        subject: "Reset your password - Academic Tracker",
        text: `We received a request to reset your password.\n\nClick the link below to choose a new password. This link expires in 30 minutes:\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
        html: `<p>We received a request to reset your password.</p><p><a href="${resetLink}">Click here to reset your password</a> (expires in 30 minutes).</p><p>If you didn't request this, you can safely ignore this email.</p>`
      });
      console.log("EMAIL SENT:", info.messageId || info);
    } catch (err) {
      console.error("EMAIL ERROR:", err);
      // Don't reveal delivery failure to the client — keeps the response
      // identical to the "no such account" case above.
    }

    res.json({ msg: genericMsg });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ msg: "Failed to process request" });
  }
};

// ================= RESET PASSWORD (via emailed link token) =================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) return res.status(400).json({ msg: "Missing reset token" });

    if (!newPassword || newPassword !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      });
    }

    const record = await PasswordReset.findOne({ tokenHash: hashToken(token) });

    if (!record) return res.status(400).json({ msg: "Invalid or already-used reset link" });

    if (Date.now() > new Date(record.expires).getTime()) {
      await PasswordReset.deleteOne({ _id: record._id });
      return res.status(400).json({ msg: "Reset link has expired. Please request a new one." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ email: record.email }, { password: hashed });

    await PasswordReset.deleteMany({ email: record.email });

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ msg: "Failed to reset password" });
  }
};

// ================= CHANGE PASSWORD (logged-in user, no OTP) =================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: "New passwords do not match" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ msg: "Current password is incorrect" });

    if (currentPassword === newPassword) {
      return res.status(400).json({ msg: "New password must be different from your current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ msg: "Failed to update password" });
  }
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];

  const decoded = jwt.decode(token);

  await Token.create({
    token,
    expiresAt: new Date(decoded.exp * 1000)
  });

  res.json({ msg: "Logged out successfully" });
};

// ================= EXPIRE SESSION =================
exports.expireSession = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await Token.create({
    token,
    expiresAt
  });

  res.json({ msg: "Session will expire in 2 hours" });
};