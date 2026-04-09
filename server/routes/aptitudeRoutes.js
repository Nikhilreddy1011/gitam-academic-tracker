const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  updateScore,
  getScore
} = require("../controllers/aptitudeController");

/**
 * @swagger
 * tags:
 *   name: Aptitude
 *   description: Aptitude score APIs
 */

/**
 * @swagger
 * /api/aptitude:
 *   get:
 *     summary: Get aptitude score
 *     tags: [Aptitude]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User score
 */
router.get("/", auth, getScore);

/**
 * @swagger
 * /api/aptitude:
 *   post:
 *     summary: Update aptitude score
 *     tags: [Aptitude]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             score: 85
 *     responses:
 *       200:
 *         description: Score updated
 */
router.post("/", auth, updateScore);

module.exports = router;