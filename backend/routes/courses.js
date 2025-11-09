const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// GET /api/courses?deptId=#
router.get("/", async (req, res) => {
  try {
    const deptId = req.query.deptId ? Number(req.query.deptId) : null;
    if (!deptId) return res.json([]);
    const list = await Course.find({ deptId }, { _id: 0, courseId: 1, courseName: 1 }).sort({ courseName: 1 });
    res.json(list);
  } catch (err) {
    console.error("Courses error", err);
    res.status(500).send([]);
  }
});

module.exports = router;
