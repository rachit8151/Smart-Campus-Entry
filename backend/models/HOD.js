const mongoose = require('mongoose');

const HODSchema = new mongoose.Schema(
  {
    dId: {
      type: Number,
      required: true,
      unique: true,
    },
    regId: {
      type: Number,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", ""], // ✅ allow empty string for initial signup
      default: "",
    },
    dob: {
      type: Date,
      default: "",
    },
    aadharNo: {
      type: String,
      default: "",
      unique: true,
      match: [/^[0-9]{12}$/, "Invalid Aadhar number (must be 12 digits)"],
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
      match: [/^[0-9]{6}$/, "Invalid pincode (must be 6 digits)"],
    },
    department: {
      type: String,
      default: "",
    },
    course: {
      type: String,
      default: "",
    },
    qualification: {
      type: String,
      default: "",
    },
    experienceYear: {
      type: Number,
      default: "",
      min: [0, "Experience cannot be negative"],
    },
    photoUrl: {
      type: String,
      default: "",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    isProfileLocked: {
      type: Boolean,
      default: false, // false = can edit, true = read-only after first update
    },
  },
  { collection: "tblHODs", timestamps: true }
);

module.exports = mongoose.model("HOD", HODSchema);
