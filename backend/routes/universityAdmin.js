const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// const Papa = require("papaparse");
const nodemailer = require("nodemailer");

const UniversityAdmin = require("../models/UniversityAdmin");
const Student = require("../models/Student");

//==============================================================
//🔹 SECTION 1 — UNIVERSITY ADMIN PROFILE (Photo Upload)
//==============================================================

// ✅ Multer setup for photo upload
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/admin_photos";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG and PNG files are allowed"), false);
    }
    cb(null, true);
  },
});

// ✅ GET - Fetch University Admin Profile by regId
router.get("/profile/:regId", async (req, res) => {
  try {
    const admin = await UniversityAdmin.findOne({ regId: req.params.regId });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.json({ success: true, admin });
  } catch (err) {
    console.error("❌ Error fetching admin profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ PUT - Update University Admin Profile (with optional photo)
router.put("/profile/:regId", uploadPhoto.single("photo"), async (req, res) => {
  try {
    const regId = req.params.regId;
    const updateData = req.body;

    // ✅ Handle new photo upload
    if (req.file) {
      const newPath = `/uploads/admin_photos/${req.file.filename}`;
      updateData.photoUrl = newPath;

      // 🧹 Remove old photo if exists
      const existing = await UniversityAdmin.findOne({ regId });
      if (existing && existing.photoUrl && fs.existsSync(`.${existing.photoUrl}`)) {
        fs.unlinkSync(`.${existing.photoUrl}`);
      }
    }

    const admin = await UniversityAdmin.findOneAndUpdate({ regId }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      admin,
    });
  } catch (err) {
    console.error("❌ Error updating admin profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: err.message,
    });
  }
});

// ============================================================
// 🔹 SECTION 2 — BULK STUDENT UPLOAD (XLSX + EMAIL)
// ============================================================
const readXlsxFile = require('read-excel-file/node');

// ✅ Multer setup for Excel upload
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/excel_files";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const uploadExcel = multer({
  storage: excelStorage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".xlsx") {
      return cb(new Error("Only Excel (.xlsx) files are allowed"), false);
    }
    cb(null, true);
  },
});

// ✅ POST — Upload Excel and Insert Students (row-by-row insertion with detailed logging)
router.post("/uploadStudents", uploadExcel.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Excel file is required." });
  }

  const filePath = req.file.path;

  try {
    const rows = await readXlsxFile(filePath);
    fs.unlink(filePath, (err) => {
      if (err) console.warn("⚠️ Could not delete temp file:", err);
    });

    if (!rows || rows.length < 2) {
      return res.status(400).json({ success: false, message: "Excel file is empty or missing header row." });
    }

    const headers = rows[0].map((h) => String(h).trim());
    const dataRows = rows.slice(1);

    const jsonArray = dataRows.map((r) => {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = r[i] !== undefined && r[i] !== null ? String(r[i]).trim() : "";
      }
      return obj;
    });

    if (!jsonArray || jsonArray.length === 0) {
      return res.status(400).json({ success: false, message: "Excel file contains no valid rows." });
    }

    let insertedCount = 0;
    const failedRows = [];
    const duplicateRows = [];

    for (const studentData of jsonArray) {
      try {
        // Skip if enrollmentNo missing
        if (!studentData.enrollmentNo) {
          failedRows.push({ enrollmentNo: "(missing)", reason: "Missing enrollment number" });
          continue;
        }

        // Check duplicate enrollmentNo
        const existing = await Student.findOne({ enrollmentNo: studentData.enrollmentNo });
        if (existing) {
          duplicateRows.push(studentData.enrollmentNo);
          continue;
        }

        // Build clean student object
        const newStudent = new Student({
          enrollmentNo: String(studentData.enrollmentNo).trim(),
          firstName: String(studentData.firstName || "").trim(),
          lastName: String(studentData.lastName || "").trim(),
          gender: String(studentData.gender || "").trim(),
          dob: studentData.dob ? new Date(studentData.dob) : null,
          aadharNo: String(studentData.aadharNo || "").replace(/['"]/g, "").trim(),
          email: String(studentData.email || "").trim(),
          phone: String(studentData.phone || "").replace(/['"]/g, "").trim(),
          address: String(studentData.address || "").trim(),
          cityName: String(studentData.cityName || "").trim(),
          district: String(studentData.district || "").trim(),
          stateName: String(studentData.stateName || "").trim(),
          pincode: String(studentData.pincode || "").trim(),
          category: String(studentData.category || "").trim(),
          nationality: String(studentData.nationality || "").trim(),
          fatherName: String(studentData.fatherName || "").trim(),
          motherName: String(studentData.motherName || "").trim(),
          schoolName: String(studentData.schoolName || "").trim(),
          religion: String(studentData.religion || "").trim(),
          deptName: String(studentData.deptName || "").trim(),
          courseName: String(studentData.courseName || "").trim(),
          academicYear: String(studentData.academicYear || "").trim(),
        });

        await newStudent.save();
        insertedCount++;
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "rachit1575@gmail.com",
              pass: "ehzhatvnuztvaatp",
            },
          });

          await transporter.sendMail({
            from: "rachit1575@gmail.com",
            to: newStudent.email,
            subject: "🎓 Smart Campus Entry - Registration Successful",
            text: `Hello ${newStudent.firstName} ${newStudent.lastName},\n\nYour registration for the academic year ${newStudent.academicYear} is successful.\n\n📘 Enrollment No: ${newStudent.enrollmentNo}\n📧 Email: ${newStudent.email}\n\nWelcome to Smart Campus Entry!`,
          });

          console.log(`📧 Email sent successfully to ${newStudent.email}`);
        } catch (mailErr) {
          console.error(`⚠️ Failed to send email to ${newStudent.email}:`, mailErr.message);
        }
      } catch (rowErr) {
        console.error(`❌ Error inserting row for enrollmentNo ${studentData.enrollmentNo}:`, rowErr.message);
        failedRows.push({
          enrollmentNo: studentData.enrollmentNo,
          reason: rowErr.message,
        });
      }
    }

    // Prepare summary
    const summary = {
      success: true,
      message: `✅ Upload complete — ${insertedCount} inserted, ${duplicateRows.length} duplicates skipped, ${failedRows.length} failed.`,
      inserted: insertedCount,
      duplicates: duplicateRows,
      failed: failedRows,
    };

    console.table(summary.failed); // Log any failed rows in table format
    res.json(summary);

  } catch (err) {
    console.error("❌ Upload Excel Error:", err);
    try { fs.unlinkSync(filePath); } catch (_) { }
    res.status(500).json({ success: false, message: "Server error during Excel upload." });
  }
});

// ======================================================
// 🔹 SECTION 3 — MANAGE HODs (Fetch, Search, Toggle Status)
// ======================================================
const HOD = require("../models/HOD");
const User = require("../models/User");
// ✅ GET all HODs (supports search by username/department)
router.get("/hods", async (req, res) => {
  try {
    const { search } = req.query;

    const users = await User.find({ roleId: 2 }).select("regId username isActive");
    let hodList = [];

    for (const user of users) {
      const hod = await HOD.findOne({ regId: user.regId }).select("department");
      if (!hod) continue;

      // ✅ Apply search filter (case insensitive)
      if (
        !search ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        hod.department.toLowerCase().includes(search.toLowerCase())
      ) {
        hodList.push({
          srNo: hodList.length + 1,
          username: user.username,
          department: hod.department,
          status: user.isActive ? "Active" : "Inactive",
          regId: user.regId,
        });
      }
    }

    res.json({ success: true, hods: hodList });
  } catch (err) {
    console.error("❌ Error fetching HODs:", err);
    res.status(500).json({ success: false, message: "Server error fetching HODs" });
  }
});

// ✅ PUT — Toggle HOD Active/Inactive
router.put("/hods/toggle/:regId", async (req, res) => {
  try {
    const user = await User.findOne({ regId: req.params.regId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `HOD is now ${user.isActive ? "Active" : "Inactive"}`,
    });
  } catch (err) {
    console.error("❌ Toggle HOD Error:", err);
    res.status(500).json({ success: false, message: "Server error toggling HOD" });
  }
});

module.exports = router;
