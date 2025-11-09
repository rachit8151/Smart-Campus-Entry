const mongoose = require('mongoose');

const FaceDataSchema = new mongoose.Schema({
  enrollmentNo: { type: String, required: true, unique: true },
  faceDataUrl: String
}, { collection: 'tblFaceData' });

module.exports = mongoose.model('FaceData', FaceDataSchema);
