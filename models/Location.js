const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  state: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  }
});

module.exports = mongoose.model('Location', locationSchema);
