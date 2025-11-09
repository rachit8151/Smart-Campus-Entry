const express = require('express');
const router = express.Router();
const Department = require('../models/Departments'); // ✅ ensure this path matches

// ✅ Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({}, { deptId: 1, deptName: 1, _id: 0 });
    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
