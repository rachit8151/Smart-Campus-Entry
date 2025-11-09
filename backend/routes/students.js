const express = require("express");
const router = express.Router();
const Student = require('../models/Student');
const FaceData = require("../models/FaceData");

//=====================================================
// ✅ Fetch students by deptName
//=====================================================
router.get("/:deptName", async (req, res) => {
    try {
        const deptName = decodeURIComponent(req.params.deptName); // handle spaces like "Int MSc.IT"
        console.log("✅ Department requested:", deptName);

        // Find all students with matching department name
        const students = await Student.find(
            { deptName: deptName },
            { enrollmentNo: 1, firstName: 1, lastName: 1, _id: 0 }
        );

        if (!students || students.length === 0) {
            console.log("⚠️ No students found for:", deptName);
            return res.status(200).json([]); // ✅ Return empty array instead of 404
        }

        // Get already captured faces
        const capturedFaces = await FaceData.find({}, { enrollmentNo: 1, _id: 0 });
        const capturedEnrollmentNos = capturedFaces.map((f) => f.enrollmentNo);

        // Filter out captured students
        const availableStudents = students.filter(
            (stu) => !capturedEnrollmentNos.includes(stu.enrollmentNo)
        );

        console.log("✅ Available Students:", availableStudents);

        res.status(200).json(availableStudents);
    } catch (err) {
        console.error("❌ Error fetching students:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//=====================================================
// ✅ SECTION 2 — Student Search & Suggestion for Guards
// =====================================================

// 🔹 2.1 — Autocomplete suggestions (like Google search)
router.get("/suggest", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.json({ success: true, suggestions: [] });
    }

    // Match anywhere, not just from start
    const regex = new RegExp(q, "i");
    const results = await Student.find({
      enrollmentNo: { $regex: regex },
    })
      .limit(5)
      .select("enrollmentNo firstName lastName");

    const formatted = results.map((r) => ({
      label: `${r.enrollmentNo} - ${r.firstName} ${r.lastName}`,
      value: r.enrollmentNo,
    }));

    res.json({ success: true, suggestions: formatted });
  } catch (err) {
    console.error("❌ Suggestion Error:", err);
    res.status(500).json({ success: false, message: "Server error fetching suggestions" });
  }
});

// 🔹 2.2 — Search by exact EnrollmentNo (with image)
router.get("/search/:enrollmentNo", async (req, res) => {
  try {
    console.log("📥 Received search request for:", req.params.enrollmentNo);
    const query = req.params.enrollmentNo.trim();

    // find student
    const student = await Student.findOne({
      enrollmentNo: { $regex: new RegExp("^" + query + "$", "i") },
    }).select("enrollmentNo deptName courseName academicYear");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in records.",
      });
    }

    // find matching face data
    const faceData = await FaceData.findOne({
      enrollmentNo: student.enrollmentNo,
    }).select("faceDataUrl");

    const studentWithFace = {
      ...student.toObject(),
      faceDataUrl: faceData ? faceData.faceDataUrl : null,
    };

    res.json({ success: true, student: studentWithFace });
  } catch (err) {
    console.error("❌ Search Error:", err);
    res.status(500).json({ success: false, message: "Server error searching student" });
  }
});


module.exports = router;
