const express = require("express");
const router = express.Router();
const State = require("../models/State");

// GET /api/states
router.get("/", async (req, res) => {
  try {
    const list = await State.find({}, { _id: 0, sId: 1, sName: 1 }).sort({ sName: 1 });
    res.json(list);
  } catch (err) {
    console.error("States error", err);
    res.status(500).send([]);
  }
});

module.exports = router;
