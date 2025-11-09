const express = require("express");
const router = express.Router();
const Guest = require("../models/Guest");

// -------------------------------------
// ✅ Auto-increment logic for gId (Guest)
// -------------------------------------
const getNextGuestId = async () => {
  const lastGuest = await Guest.findOne().sort({ gId: -1 });
  return lastGuest ? lastGuest.gId + 1 : 1;
};
// ================================
// ✅ POST - Register Guest by HOD
// ================================
router.post("/add", async (req, res) => {
  console.log("Guest add request received:", req.body);
  try {
    const { dId, guestName, contact, visitPurpose, visitDate, enterTime, outTime } = req.body;
    if (!dId) {
      return res.status(400).json({ error: "Department ID (dId) is required." });
    }
    const gId = await getNextGuestId();

    const newGuest = new Guest({
      gId,
      dId,
      guestName,
      contact,
      visitPurpose,
      visitDate,
      enterTime,
      outTime,
    });

    await newGuest.save();
    res.json({ success: true, message: "Guest registered successfully", guest: newGuest });
  } catch (err) {
    console.error("❌ Error adding guest:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    res.status(500).json({ success: false, message: "Server error while adding guest" });
  }
});

// ==========================================
// ✅ GET - Fetch Guests by Department (for Admin or HOD view)
// ==========================================
router.get("/byDepartment/:dId", async (req, res) => {
  console.log("Fetching guests for department:", req.params.dId);
  try {
    // Convert to Number
    const departmentId = Number(req.params.dId);

    if (isNaN(departmentId)) {
      return res.status(400).json({ error: "Invalid Department ID" });
    }

    const guests = await Guest.find({ dId: departmentId }).sort({ createdAt: -1 });

    res.json(guests);
  } catch (err) {
    console.error("❌ Fetch guests error:", err);
    res.status(500).json({ error: "Server error while fetching guests" });
  }
});


// ==========================================
// ✅ PUT - Approve or Reject Guest
// ==========================================
router.put("/updateStatus/:gId", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedGuest = await Guest.findOneAndUpdate(
      { gId: req.params.gId },
      { status, hodNotified: false },
      { new: true }
    );

    if (!updatedGuest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    // ✅ Safe socket emit
    const io = req.app.get("io");
    const dId = updatedGuest.dId;

    if (io && global.connectedHODs && global.connectedHODs[dId]) {
      io.to(global.connectedHODs[dId]).emit("guestStatusUpdate", {
        guestName: updatedGuest.guestName,
        status: updatedGuest.status,
        date: new Date(updatedGuest.updatedAt).toLocaleDateString(),
      });
    }

    res.json({
      success: true,
      message: `Guest ${status.toLowerCase()} successfully`,
      guest: updatedGuest,
    });
  } catch (err) {
    console.error("❌ Update guest status error:", err);
    res.status(500).json({ error: "Server error while updating guest status" });
  }
});


// ==========================================
// ✅ GET - Count Unread (Pending) Guests for Admin Dashboard
// ==========================================
router.get("/unreadCount", async (req, res) => {
  try {
    const count = await Guest.countDocuments({ status: "Pending", isRead: false });
    res.json({ success: true, unreadCount: count });
  } catch (err) {
    console.error("❌ Error fetching unread guest count:", err);
    res.status(500).json({ success: false, message: "Server error while counting guests" });
  }
});
// ==========================================
// ✅ PUT - Mark all Pending Guests as Read (when admin opens page)
// ==========================================
router.put("/markAllRead", async (req, res) => {
  try {
    await Guest.updateMany({ status: "Pending", isRead: false }, { isRead: true });
    res.json({ success: true, message: "All pending guests marked as read" });
  } catch (err) {
    console.error("❌ Error marking guests as read:", err);
    res.status(500).json({ success: false, message: "Server error while marking as read" });
  }
});


module.exports = router;
