const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Token = require("../models/Token");

// ================= EMAIL VALIDATION =================
const allowedDomains = [
  "@gitam.in",
  "@gitam.edu",
  "@student.gitam.edu"
];

const isValidGitamEmail = (email) => {
  return allowedDomains.some(domain => email.endsWith(domain));
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
    const { email } = req.body;

    if (!isValidGitamEmail(email)) {
      return res.status(400).json({
        msg: "Only GITAM email IDs are allowed"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp,
      expires: Date.now() + 600000
    });

    // 🔥 Respond immediately
    const info = await transporter.sendMail({
      from: '"GITAM Academic Tracker" <nikhilreddymodugu123@gmail.com>',
      to: email,
      subject: "OTP Verification - Academic Tracker",
      text: `Your OTP is: ${otp}`
    });
    
    console.log("✅ EMAIL SENT:", info.response);
    
    res.json({ msg: "OTP sent successfully" });

    // 📧 Send email AFTER response (background)
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    transporter.verify((error, success) => {
      if (error) {
        console.log("❌ SMTP ERROR:", error);
      } else {
        console.log("✅ BREVO SMTP READY");
      }
    });

    transporter.sendMail({
      from: '"GITAM Academic Tracker" <nikhilreddymodugu123@gmail.com>',
      to: email,
      subject: "OTP Verification - Academic Tracker",
      text: `Your OTP is: ${otp}`
    })
    .then(info => {
      console.log("✅ EMAIL SENT:", info.response);
    })
    .catch(err => {
      console.error("❌ EMAIL FAILED:", err);
    });
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
  const { email, otp } = req.body;

  const record = await OTP.findOne({
    email,
    otp: otp.toString()
  });

  if (!record) return res.status(400).json({ msg: "Invalid OTP" });

  if (Date.now() > record.expires)
    return res.status(400).json({ msg: "OTP expired" });

  res.json({ msg: "OTP verified" });
};

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const {
      email,
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
        msg: "Only GITAM email IDs are allowed"
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

    await OTP.deleteMany({ email });

    const token = generateToken(user);

    const { password: _, ...safeUser } = user._doc;

    res.json({ token, user: safeUser });

  } catch (err) {
    res.status(500).json({ msg: "Signup failed" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!isValidGitamEmail(email)) {
    return res.status(400).json({
      msg: "Only GITAM email IDs are allowed"
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

// ================= SEND RESET OTP =================
exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!isValidGitamEmail(email)) {
    return res.status(400).json({
      msg: "Only GITAM email IDs are allowed"
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.deleteMany({ email });

  await OTP.create({
    email,
    otp,
    expires: Date.now() + 5 * 60 * 1000
  });

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  transporter.sendMail({
    from: '"GITAM Academic Tracker" <nikhilreddymodugu123@gmail.com>',
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is: ${otp}`
  })
  .then(info => {
    console.log("✅ EMAIL SENT:", info.response);
  })
  .catch(err => {
    console.error("❌ EMAIL FAILED:", err);
  });
  res.json({ msg: "Reset OTP sent to email" });
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const record = await OTP.findOne({
    email,
    otp: otp.toString()
  });

  if (!record) return res.status(400).json({ msg: "Invalid OTP" });

  if (Date.now() > record.expires)
    return res.status(400).json({ msg: "OTP expired" });

  // 🔐 Password strength check
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      msg: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await User.findOneAndUpdate({ email }, { password: hashed });

  await OTP.deleteMany({ email });

  res.json({ msg: "Password updated successfully" });
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