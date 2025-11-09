const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const HOD = require("../models/HOD");

// ============================================================
// ✅ MULTER CONFIGURATION (for file uploads)
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/hod_photos";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); // create if missing
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}_${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG and PNG files are allowed"), false);
    }
    cb(null, true);
  },
});

// ============================================================
// ✅ GET - Fetch HOD Profile by dId
// ============================================================
router.get("/profile/:dId", async (req, res) => {
  try {
    const dId = req.params.dId; // keep string (matches MongoDB)
    const hod = await HOD.findOne({ dId });

    if (!hod) {
      return res.status(404).json({ success: false, message: "HOD not found" });
    }

    res.json({ success: true, hod });
  } catch (err) {
    console.error("❌ Error fetching HOD profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================================================
// ✅ PUT - Update HOD Profile (with optional image upload)
// ============================================================
router.put("/profile/:dId", upload.single("photo"), async (req, res) => {
  try {
    const dId = req.params.dId;
    const updateData = req.body;

    // ✅ Fetch current HOD record
    const existing = await HOD.findOne({ dId });
    if (!existing) {
      return res.status(404).json({ success: false, message: "HOD not found" });
    }

    // ✅ If profile already locked, deny further edits
    if (existing.isProfileLocked) {
      return res.status(403).json({
        success: false,
        message: "Profile update not allowed. Contact admin for changes.",
      });
    }

    // ✅ Handle photo upload
    if (req.file) {
      const newPath = `/uploads/hod_photos/${req.file.filename}`;
      updateData.photoUrl = newPath;

      if (existing.photoUrl && fs.existsSync(`.${existing.photoUrl}`)) {
        fs.unlinkSync(`.${existing.photoUrl}`);
      }
    }

    // ✅ Mark profile as locked after first successful save
    updateData.isProfileLocked = true;

    const hod = await HOD.findOneAndUpdate({ dId }, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Profile updated successfully and locked for future edits.",
      hod,
    });
  } catch (err) {
    console.error("❌ Error updating HOD profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: err.message,
    });
  }
});

module.exports = router;
