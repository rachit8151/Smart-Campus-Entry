const mongoose = require("mongoose");

const StateSchema = new mongoose.Schema(
  {
    sId: { type: Number, required: true, unique: true },
    sName: { type: String, required: true, trim: true }
  },
  { collection: "tblStates" }
);

module.exports = mongoose.model("State", StateSchema);
