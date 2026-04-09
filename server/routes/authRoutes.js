const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

// ===== SEND OTP =====
/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to Gmail
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: user@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent to email
 */
router.post("/send-otp", c.sendOtp);

// ===== VERIFY OTP =====
/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP sent to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: user@gmail.com
 *             otp: "123456"
 *     responses:
 *       200:
 *         description: OTP verified
 */
router.post("/verify-otp", c.verifyOtp);

// ===== SIGNUP =====
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register new user (OTP required)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: user@gmail.com
 *             password: "Nikhil@123"
 *             confirmPassword: "Nikhil@123"
 *             name: "Nikhil"
 *             regNo: "123"
 *             branch: "CSE"
 *             batch: "2026"
 *             otp: "123456"
 *     responses:
 *       200:
 *         description: Signup successful
 */
router.post("/signup", c.signup);

// ===== LOGIN =====
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: user@gmail.com
 *             password: "Nikhil@123"
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", c.login);

// ===== LOGOUT =====
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", auth, c.logout);

// ===== EXPIRE SESSION =====
/**
 * @swagger
 * /api/auth/expire:
 *   post:
 *     summary: Expire session manually
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session expired
 */
router.post("/expire", auth, c.expireSession);

module.exports = router;