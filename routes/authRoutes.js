const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = 'supersecretkey_ecotrack';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, location } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const count = await User.countDocuments();
    const _id = `USR${String(count + 1).padStart(3, '0')}`;

    const newUser = new User({
      _id, name, email, password: hashedPassword, role, phone, location, isVerified: true
    });
    await newUser.save();
    
    // auto login
    const token = jwt.sign({ id: newUser._id, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: newUser._id, role: newUser.role, name: newUser.name } });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
