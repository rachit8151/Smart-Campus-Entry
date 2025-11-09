// ==========================
// ✅ SECURE AUTH.JS (Final Production Version)
// ==========================
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const UniversityAdmin = require('../models/UniversityAdmin');
const HOD = require('../models/HOD');
const SecurityGuard = require('../models/SecurityGuard');
const { sendCredentialsEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// -------------------------------------
// Auto-increment logic for regId
// -------------------------------------
const getNextRegId = async () => {
  const lastUser = await User.findOne().sort({ regId: -1 });
  return lastUser ? lastUser.regId + 1 : 1;
};
// -------------------------------------
// ✅ Auto-increment logic for dId (HOD)
// -------------------------------------
const getNextHODId = async () => {
  const lastHOD = await HOD.findOne().sort({ dId: -1 });
  return lastHOD ? lastHOD.dId + 1 : 1;
};
// -------------------------------------
// ✅ Auto-increment logic for sgId (Security Guard)
// -------------------------------------
const getNextsgId = async () => {
  const lastGuard = await SecurityGuard.findOne().sort({ sgId: -1 });
  return lastGuard ? lastGuard.sgId + 1 : 1;
};

// =====================================
// ✅ SIGNUP (Hash password + role insertion)
// =====================================
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, cpassword, phone, roleId, extra } = req.body;

    if (!username || !email || !password || !cpassword || !phone || roleId == null) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== cpassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const regId = await getNextRegId();
    const dId = await getNextHODId();

    // 🔒 Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      regId,
      username,
      email,
      password: hashedPassword,
      phone,
      roleId: Number(roleId),
      status: false // must change password on first login
    });

    // ✅ Role-based insertion
    if (roleId === 2) {
      await HOD.create({
        dId,
        regId,
        firstName: extra?.firstName || "",
        lastName: extra?.lastName || "",
        department: extra?.department || "",
        joiningDate: extra?.joiningDate ? new Date(extra.joiningDate) : new Date()
      });
    } else if (roleId === 3) {
      const sgId = await getNextsgId();
      console.log("🆕 Creating SecurityGuard — sgId:", sgId, "regId:", regId, "extra:", extra);

      await SecurityGuard.create({
        sgId,                     // ✅ new auto incremented sgId
        regId,                    // ✅ from newly created User
        firstName: extra?.firstName || "",
        lastName: extra?.lastName || "",
        gender: extra?.gender || "",
        dob: extra?.dob || null,
        aadharNo: extra?.aadharNo || "",
        address: extra?.address || "",
        shift: extra?.shift || "", // ✅ entered at signup
        joiningDate: extra?.joiningDate
          ? new Date(extra.joiningDate)
          : new Date(),
      });
    }


    // 🔹 Email Notification
    // await sendCredentialsEmail(email, username);
    await sendCredentialsEmail(email, username, password);

    res.json({
      success: true,
      message: "Signup successful. Please change password on first login."
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =====================================
// ✅ LOGIN (with bcrypt + lock on 3 failed attempts)
// =====================================
router.post('/login', async (req, res) => {
  try {
    console.log("🟢 LOGIN route hit!");
    console.log("📦 Body received:", req.body);

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      console.log("❌ Missing identifier or password");
      return res.status(400).json({ error: "Email/Username and password required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      console.log("❌ No user found for:", identifier);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Auto-clear lock if time expired
    if (user.lockUntil && user.lockUntil < Date.now()) {
      user.lockUntil = null;
      user.failedAttempts = 0;
      await user.save();
    }

    // 🚫 Account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(403).json({
        error: `Your account is locked. Please try again after ${remaining} minute(s).`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;

      if (user.failedAttempts >= 3) {
        // Lock for 5 minutes
        user.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
        user.failedAttempts = 0;
        await user.save();
        return res.status(403).json({
          error: "Too many failed attempts. Account locked for 5 minutes."
        });
      }

      await user.save();
      return res.status(400).json({
        error: `Invalid password. You have ${3 - user.failedAttempts} attempt(s) left before lock.`
      });
    }

    // ✅ Successful password match — reset counters
    user.failedAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // 🚫 Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        error: "Your account is deactivated. Contact the University Admin."
      });
    }

    // Auto-create missing UniversityAdmin record (if role 1)
    if (user.roleId === 1) {
      const existingAdmin = await UniversityAdmin.findOne({ regId: user.regId });
      if (!existingAdmin) {
        await UniversityAdmin.create({
          regId: user.regId,
          firstName: "",
          lastName: "",
          adminId: `ADM-${user.regId}`
        });
      }
    }

    // Create JWT Token
    const payload = { user: { id: user._id, roleId: user.roleId, regId: user.regId } };
    const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // If first-time login, force password change
    if (!user.status) {
      return res.json({
        forceChange: true,
        userId: user._id.toString(),
        user: { username: user.username, roleId: user.roleId },
        authToken
      });
    }
    // ✅ Successful login with HOD dId check
    let dId = null;
    if (user.roleId === 2) {
      const hod = await HOD.findOne({ regId: user.regId });
      if (hod) dId = hod.dId;
    }
    let sgId = null;
    if (user.roleId === 3) {
      const guard = await SecurityGuard.findOne({ regId: user.regId });
      if (guard) sgId = guard.sgId;
    }
    // ✅ Successful login
    return res.json({
      forceChange: false,
      userId: user._id.toString(),
      user: {
        username: user.username,
        roleId: user.roleId,
        regId: user.regId,
        dId: dId, // ✅ include dId if HOD
        sgId: sgId // ✅ include for Security Guard
      },
      authToken
    });
  }
  catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =====================================
// ✅ CHANGE PASSWORD (normal + first login)
// =====================================
router.post('/changePassword', async (req, res) => {
  try {
    const { regId, oldPassword, newPassword } = req.body;

    if (!regId || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ regId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid old password' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.status = true;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =====================================
// ✅ GET ROLES
// =====================================
// ✅ Only return HOD and SecurityGuard roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find({ roleId: { $ne: 1 } }); // exclude roleId 1
    res.json(roles);
  } catch (err) {
    console.error("Roles fetch error:", err);
    res.status(500).send("Server Error");
  }
});

// =====================================
// ✅ CHECK USERNAME / EMAIL AVAILABILITY
// =====================================
router.get('/check-availability', async (req, res) => {
  try {
    const { username, email } = req.query;

    let query = {};
    if (username) query.username = username;
    if (email) query.email = email;

    if (Object.keys(query).length === 0)
      return res.status(400).json({ error: 'Missing username or email' });

    const exists = await User.exists(query);
    res.json({ exists: !!exists });
  } catch (err) {
    console.error('Check availability error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
