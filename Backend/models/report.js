const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  vehicleCategory: String,
  vehicleNumber: String,
  pollutionType: String,
  location: String,
  phoneNumber: String,
  details: String,
  images: [
    {
      data: Buffer,
      contentType: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
