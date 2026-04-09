const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  getProfile,
  updateProfile,
  updateAcademic
} = require("../controllers/profileController");

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile APIs
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get("/", auth, getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update profile details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Nikhil"
 *             phone: "9876543210"
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/", auth, updateProfile);

/**
 * @swagger
 * /api/profile/academic:
 *   put:
 *     summary: Update academic details
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             regNo: "12345"
 *             branch: "CSE"
 *             batch: "2026"
 *     responses:
 *       200:
 *         description: Academic details updated
 */
router.put("/academic", auth, updateAcademic);

module.exports = router;