//backend/routes/forgetPassword.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/change-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
