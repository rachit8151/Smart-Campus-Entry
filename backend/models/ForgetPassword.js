// // backend/models/ForgetPassword.js
// const mongoose = require('mongoose');

// const TokenSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "User"
//   },
//   token: {
//     type: String,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//     expires: 3600 // 1 hour
//   }
// });

// module.exports = mongoose.model("PasswordResetToken", TokenSchema);
// =====================================
// ✅ ForgetPassword Model (for OTP reset)
// =====================================
const mongoose = require('mongoose');

const ForgetPasswordSchema = new mongoose.Schema({
  // The user's email requesting reset
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 600 },
  },
}, { timestamps: true });

module.exports = mongoose.model('ForgetPassword', ForgetPasswordSchema);
