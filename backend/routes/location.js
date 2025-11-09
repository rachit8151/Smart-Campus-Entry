const express = require("express");
const router = express.Router();
const State = require("../models/State");
const City = require("../models/City");

// ✅ Get all states
router.get("/states", async (req, res) => {
  try {
    const states = await State.find({}, { _id: 0, sId: 1, sName: 1 });
    res.json({ success: true, states });
  } catch (err) {
    console.error("Error fetching states:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get cities for a given state
router.get("/cities/:sId", async (req, res) => {
  try {
    const cities = await City.find({ sId: Number(req.params.sId) }, { _id: 0, cId: 1, cName: 1, pincode: 1 });
    res.json({ success: true, cities });
  } catch (err) {
    console.error("Error fetching cities:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Get pincode by city name (optional)
router.get("/pincode/:cityName", async (req, res) => {
  try {
    const city = await City.findOne({ cName: req.params.cityName });
    if (!city) return res.status(404).json({ success: false, message: "City not found" });
    res.json({ success: true, pincode: city.pincode });
  } catch (err) {
    console.error("Error fetching pincode:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
