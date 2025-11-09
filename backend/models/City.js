const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema(
  {
    cId: { type: Number, required: true, unique: true },
    cName: { type: String, required: true, trim: true },
    sId: { type: Number, required: true, ref: "State" },
    pincode: { type: String, required: true }
  },
  { collection: "tblCities" }
);

module.exports = mongoose.model("City", CitySchema);
