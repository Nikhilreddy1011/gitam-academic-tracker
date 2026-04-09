const jwt = require("jsonwebtoken");
const Token = require("../models/Token");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader) {
      return res.status(401).json({ msg: "No token provided" });
    }

    let token;

    // ✅ Safe check
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    // ❌ Still no token
    if (!token) {
      return res.status(401).json({ msg: "Token missing" });
    }

    // 🔥 CHECK BLACKLIST
    const blocked = await Token.findOne({ token });

    if (blocked && blocked.expiresAt > new Date()) {
      return res.status(401).json({
        msg: "Session expired / logged out"
      });
    }

    // 🔐 VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user
    req.user = decoded;

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err.message);

    return res.status(401).json({
      msg: "Invalid or expired token"
    });
  }
};