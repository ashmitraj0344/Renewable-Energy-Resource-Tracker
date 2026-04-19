const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  buyerId: { type: String, ref: 'User', required: true },
  projectId: { type: String, ref: 'Project', required: true },
  amountINR: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
