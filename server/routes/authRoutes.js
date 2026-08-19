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

// ===== FORGOT PASSWORD (send reset link) =====
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Email a password-reset link to the user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: user@gmail.com
 *     responses:
 *       200:
 *         description: Reset link sent (generic response whether or not the account exists)
 */
router.post("/forgot-password", c.forgotPassword);

// ===== RESET PASSWORD (via emailed link token) =====
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using the token from the reset-link email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             token: "raw-token-from-email-link"
 *             newPassword: "Nikhil@123"
 *             confirmPassword: "Nikhil@123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post("/reset-password", c.resetPassword);

// ===== CHANGE PASSWORD (logged-in user) =====
/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password for the logged-in user (verifies current password)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             currentPassword: "OldPass@123"
 *             newPassword: "NewPass@123"
 *             confirmPassword: "NewPass@123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post("/change-password", auth, c.changePassword);

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