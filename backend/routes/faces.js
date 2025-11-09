// backend/routes/faces.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const FaceData = require("../models/FaceData"); // your FaceData model

// ---------------------------------------------------------------
// 📁 Directory where student photos will be saved
// ---------------------------------------------------------------
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "students_photos");
fs.ensureDirSync(UPLOAD_DIR); // creates folder if not exists

// ---------------------------------------------------------------
// 🧰 Multer configuration for storing files
// ---------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Multer doesn't parse req.body before saving, so fallback from filename if needed
    let enrollmentNo = "unknown";
    const originalName = file.originalname || "";
    const ext = path.extname(originalName) || ".jpg";

    // Prefer enrollmentNo from query if sent by frontend
    if (req.body && req.body.enrollmentNo) {
      enrollmentNo = req.body.enrollmentNo.trim();
    } else if (originalName && originalName !== "blob") {
      enrollmentNo = path.basename(originalName, ext);
    }

    cb(null, `${enrollmentNo}${ext}`);
  },
});


const upload = multer({ storage });

// ---------------------------------------------------------------
// 📤 POST route: Upload and save student face image
// ---------------------------------------------------------------
router.post("/upload", upload.single("faceImage"), async (req, res) => {
  console.log("📸 Received upload for:", req.body.enrollmentNo);
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "❌ No file uploaded" });
    }

    const { enrollmentNo } = req.body;
    const filePath = `/uploads/students_photos/${req.file.filename}`;

    // ✅ Save or update in MongoDB
    await FaceData.findOneAndUpdate(
      { enrollmentNo },
      { enrollmentNo, faceDataUrl: filePath },
      { upsert: true, new: true }
    );

    console.log(`✅ Face stored: ${enrollmentNo} → ${filePath}`);
    res.json({
      success: true,
      message: "✅ Face captured and saved successfully!",
      filePath,
    });
  } catch (err) {
    console.error("❌ Error saving face:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
