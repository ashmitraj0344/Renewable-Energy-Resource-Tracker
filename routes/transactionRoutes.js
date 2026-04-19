const express = require('express');
const Transaction = require('../models/Transaction');

const router = express.Router();

router.post('/', async (req, res) => {
  const { buyerId, projectId, amountINR } = req.body;
  try {
    const newTransaction = new Transaction({ buyerId, projectId, amountINR });
    await newTransaction.save();
    res.json(newTransaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.buyerId) query.buyerId = req.query.buyerId;
    const transactions = await Transaction.find(query).populate('projectId').sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
