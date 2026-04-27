const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_ecotrack';

// Store OTPs temporarily (in-memory for simple implementation)
// Format: { email: { otp: '123456', expiresAt: 1234567890 } }
const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

// Send OTP Route
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists with this email' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    otpStore.set(email, { otp, expiresAt });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your EcoTrack Verification Code',
      text: `Welcome to EcoTrack! Your verification code is: ${otp}\nThis code will expire in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error("OTP Send Error: ", err);
    res.status(500).json({ error: 'Failed to send OTP. Ensure email credentials are correct in .env.' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, location, otp } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    // Verify OTP
    const storedOtpData = otpStore.get(email);
    if (!storedOtpData) return res.status(400).json({ error: 'No OTP requested for this email' });
    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (storedOtpData.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    
    // Clear OTP after successful verification
    otpStore.delete(email);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const lastUser = await User.findOne().sort({ _id: -1 });
    let nextCount = 1;
    if (lastUser && lastUser._id && lastUser._id.startsWith('USR')) {
      nextCount = parseInt(lastUser._id.replace('USR', ''), 10) + 1;
    } else {
      nextCount = (await User.countDocuments()) + 1;
    }
    const _id = `USR${String(nextCount).padStart(3, '0')}`;

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
