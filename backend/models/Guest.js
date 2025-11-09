const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema(
  {
    gId: {
      type: Number,
      unique: true,
      required: true,
    },
    dId: {
      type: Number,
      required: true,
      ref: "tblHODs", // Foreign key reference
    },
    guestName: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
      match: [/^[A-Za-z\s]+$/, "Guest name should contain only letters and spaces"],
    },
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^[0-9]{10}$/, "Contact number must be exactly 10 digits"],
    },
    visitPurpose: {
      type: String,
      required: [true, "Visit purpose is required"],
      trim: true,
      minlength: [5, "Purpose should have at least 5 characters"],
    },
    visitDate: {
      type: Date,
      required: [true, "Visit date is required"],
      validate: {
        validator: function (v) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const visit = new Date(v);
          visit.setHours(0, 0, 0, 0);
          return visit > today; // ✅ must be strictly greater than today
        },
        message: "Visit date must be a future date (not today)",
      },
    },

    enterTime: {
      type: String,
      required: [true, "Enter time is required"],
    },
    outTime: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    // 👇 ADD THIS FIELD
    isRead: {
      type: Boolean,
      default: false, // false = unread, true = seen by admin
    },
    hodNotified: {
      type: Boolean,
      default: false, // false = not shown yet to HOD
    },
  },
  { collection: "tblGuests", timestamps: true }
);

module.exports = mongoose.model("Guest", GuestSchema);
