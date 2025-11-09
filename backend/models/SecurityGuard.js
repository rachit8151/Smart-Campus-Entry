const mongoose = require("mongoose");

const SecurityGuardSchema = new mongoose.Schema(
  {
    sgId: {
      type: Number,
      unique: true,
      required: true
    },
    // 🔹 Foreign Key link with tblRegistration
    regId: {
      type: Number,
      required: true,
      unique: true
    },
    // 🔹 Guard Personal Details
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", ""], // ✅ allow empty string for initial signup
      default: "",
    },
    dob: {
      type: Date,
      default: null,
    },
    aadharNo: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    // 🔹 Work / Assignment Info
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night"],
      default: "",
    },
    joiningDate: {
      type: Date,
      required: false, // filled by University Admin during signup
      default: null,
    },
    // 🔹 Profile photo
    photoUrl: {
      type: String,
      default: "", // store backend path like `/uploads/guard_photos/xyz.jpg`
    },
    // 🔹 Optional Status Flags
    status: {
      type: Boolean,
      default: true, // active by default
    },
    isProfileLocked: { 
      type: Boolean, 
      default: false 
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "tblSecurityGuards", timestamps: true }
);

// ✅ Correct export name
module.exports = mongoose.model("SecurityGuard", SecurityGuardSchema);
