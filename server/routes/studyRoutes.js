const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  addPlan,
  getPlans,
  deletePlan
} = require("../controllers/studyController");

/**
 * @swagger
 * tags:
 *   name: Study
 *   description: Study management APIs
 */

/**
 * @swagger
 * /api/study:
 *   get:
 *     summary: Get all study plans
 *     tags: [Study]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of study plans
 */
router.get("/", auth, getPlans);

/**
 * @swagger
 * /api/study:
 *   post:
 *     summary: Add a new study plan
 *     tags: [Study]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               subject: "Math"
 *               topic: "Algebra"
 *               duration: 2
 *     responses:
 *       200:
 *         description: Study plan created
 */
router.post("/", auth, addPlan);

/**
 * @swagger
 * /api/study/{id}:
 *   delete:
 *     summary: Delete a study plan
 *     tags: [Study]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Study plan deleted
 */
router.delete("/:id", auth, deletePlan);

module.exports = router;