const mongoose = require('mongoose');

const energyLogSchema = new mongoose.Schema({
  projectId: { type: String, ref: 'Project', required: true },
  energyGeneratedKWh: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EnergyLog', energyLogSchema);
