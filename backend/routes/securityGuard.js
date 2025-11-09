const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const SecurityGuard = require("../models/SecurityGuard");

// ============================================================
// ✅ MULTER CONFIGURATION (for file uploads)
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/guard_photos";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
// ✅ GET - Fetch Security Guard Profile by sgId
// ============================================================
router.get("/profile/:sgId", async (req, res) => {
  try {
    const sgId = req.params.sgId;
    const guard = await SecurityGuard.findOne({ sgId });

    if (!guard)
      return res.status(404).json({ success: false, message: "Security Guard not found" });

    res.json({ success: true, guard });
  } catch (err) {
    console.error("❌ Error fetching Security Guard profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================================================
// ✅ PUT - Update Security Guard Profile (with optional image upload)
// ============================================================
router.put("/profile/:sgId", upload.single("photo"), async (req, res) => {
  try {
    const sgId = req.params.sgId;
    const updateData = req.body;

    const existing = await SecurityGuard.findOne({ sgId });
    if (!existing)
      return res.status(404).json({ success: false, message: "Security Guard not found" });

    // ✅ Prevent edit if already locked
    if (existing.isProfileLocked) {
      return res.status(403).json({
        success: false,
        message: "Profile update not allowed. Contact admin for changes.",
      });
    }

    // ✅ Handle photo upload
    if (req.file) {
      const newPath = `/uploads/guard_photos/${req.file.filename}`;
      updateData.photoUrl = newPath;
      if (existing.photoUrl && fs.existsSync(`.${existing.photoUrl}`)) {
        fs.unlinkSync(`.${existing.photoUrl}`);
      }
    }

    // ✅ Lock only when all key fields filled
    const requiredFields = ["firstName", "lastName", "gender", "dob", "aadharNo"];
    const allFilled = requiredFields.every(
      (f) => updateData[f] && updateData[f].toString().trim() !== ""
    );
    if (allFilled) updateData.isProfileLocked = true;

    const guard = await SecurityGuard.findOneAndUpdate({ sgId }, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: guard.isProfileLocked
        ? "Profile updated and locked successfully."
        : "Profile updated successfully.",
      guard,
    });
  } catch (err) {
    console.error("❌ Error updating Security Guard profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: err.message,
    });
  }
});

module.exports = router;
