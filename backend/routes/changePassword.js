// =====================================
// ✅ SECURE CHANGE PASSWORD ROUTE (handles both first-time & normal change)
// =====================================
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const fetchUser = require('../middleware/fetchUser');
const bcrypt = require('bcryptjs');

// =====================================
// ✅ 1️⃣ Normal change password (authenticated users)
// =====================================
router.post('/changePassword', fetchUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password required.' });
  }

  try {
    // Find user using regId from token
    const user = await User.findOne({ regId: req.user.regId });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // If currentPassword provided, verify old password
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Current password incorrect.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    user.status = true;
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// =====================================
// ✅ 2️⃣ First-time login (no JWT yet)
// =====================================
router.post('/firstTimeChange', async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'User ID and new password are required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    user.status = true;
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully. You can now login.' });
  } catch (err) {
    console.error('First-time password change error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
