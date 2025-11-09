const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    enrollmentNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    aadharNo: {
      type: String,
      trim: true,
      match: [/^[0-9]{12}$/, "Invalid Aadhar number (must be 12 digits)"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Invalid phone number (must be 10 digits)"],
    },
    address: {
      type: String,
      trim: true,
    },
    cityName: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    stateName: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^[0-9]{6}$/, "Invalid pincode (must be 6 digits)"],
    },
    category: {
      type: String,
      trim: true,
      enum: ["General", "OBC", "SC", "ST", "EWS", "Other"],
    },
    nationality: {
      type: String,
      default: "Indian",
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    schoolName: {
      type: String,
      trim: true,
    },
    religion: {
      type: String,
      trim: true,
    },
    deptName: {
      type: String,
      trim: true,
    },
    courseName: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      trim: true,
      match: [/^[0-9]{4}-[0-9]{2}$/, "Invalid academic year format (use YYYY-YY)"],
      required: true,
    },
  },
  { collection: "tblStudents", timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
