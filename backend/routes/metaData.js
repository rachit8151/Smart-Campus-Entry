const express = require("express");
const router = express.Router();

const NATIONALITIES = [
  "Indian", "American", "British", "Canadian", "Australian", "Other"
];
const RELIGIONS = [
  "Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Other"
];
const CATEGORIES = [
  "General", "OBC", "SC", "ST", "EWS", "Other"
];

// ================================
// GET /api/nationalities
// ================================
router.get("/nationalities", (req, res) => {
  res.json({ success: true, data: NATIONALITIES });
});

// ================================
// GET /api/religions
// ================================
router.get("/religions", (req, res) => {
  res.json({ success: true, data: RELIGIONS });
});

// ================================
// GET /api/categories
// ================================
router.get("/categories", (req, res) => {
  res.json({ success: true, data: CATEGORIES });
});

module.exports = router;
