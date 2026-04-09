const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  addEvent,
  getEvents,
  deleteEvent
} = require("../controllers/eventController");

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management APIs
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/", auth, getEvents);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Add a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             title: "Exam"
 *             date: "2026-04-10"
 *             description: "Math exam"
 *     responses:
 *       200:
 *         description: Event created
 */
router.post("/", auth, addEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
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
 *         description: Event deleted
 */
router.delete("/:id", auth, deleteEvent);

module.exports = router;