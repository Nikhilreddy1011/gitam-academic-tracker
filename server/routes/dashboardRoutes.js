const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getDashboard } = require("../controllers/dashboardController");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard APIs
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               totalTasks: 10
 *               completed: 5
 *               pending: 5
 */
router.get("/", auth, getDashboard);

module.exports = router;