// backend/models/UniversityAdmin.js
const mongoose = require("mongoose");

const UniversityAdminSchema = new mongoose.Schema(
  {
    regId: {
      type: Number,
      required: true,
      unique: true,
    },
    adminId: {
      type: String,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    aadharNo: {
      type: String,
      required: true,
      unique: true,
      match: [/^[0-9]{12}$/, "Invalid Aadhar number (must be 12 digits)"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
      match: [/^[0-9]{6}$/, "Invalid pincode (must be 6 digits)"],
    },
    photoUrl: {
      type: String,
      default: "",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "tblUniversityAdmin", timestamps: true }
);

module.exports = mongoose.model("UniversityAdmin", UniversityAdminSchema);
