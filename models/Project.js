const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  energyType: { type: String, enum: ['solar', 'wind', 'hydro', 'biomass'], required: true },
  locationId: { type: String, ref: 'Location', required: true },
  createdBy: { type: String, ref: 'User', required: true },
  capacityKW: { type: Number, required: true },
  pricePerKWh: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
