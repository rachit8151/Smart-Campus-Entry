const express = require("express");
const router = express.Router();
const City = require("../models/City");

// GET /api/cities?stateId=#
router.get("/", async (req, res) => {
  try {
    const stateId = req.query.stateId ? Number(req.query.stateId) : null;
    if (!stateId) return res.json([]);
    const list = await City.find({ sId: stateId }, { _id: 0, cId: 1, cName: 1 }).sort({ cName: 1 });
    res.json(list);
  } catch (err) {
    console.error("Cities error", err);
    res.status(500).send([]);
  }
});

module.exports = router;
