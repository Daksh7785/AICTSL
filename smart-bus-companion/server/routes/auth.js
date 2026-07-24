const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { sendEmail } = require('../utils/email');
const { auth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshSecret123';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
};

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { _id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { _id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(20).toString('hex');

    user = new User({
      name,
      email,
      passwordHash,
      role: role || 'commuter',
      verificationToken
    });

    await user.save();

    const verifyUrl = `${CLIENT_URL}/api/auth/verify/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your Smart Bus Companion account',
      text: `Please click on this link to verify your email: ${verifyUrl}`
    });

    res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    // Redirect to login page on client
    res.redirect(`${CLIENT_URL}/login?verified=true`);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({ token: refreshToken, user: user._id, expiresAt });

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ role: user.role, isVerified: user.isVerified, name: user.name });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token provided' });

    const existingToken = await RefreshToken.findOne({ token }).populate('user');
    if (!existingToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    try {
      jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
      await RefreshToken.deleteOne({ _id: existingToken._id });
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Rotate token
    await RefreshToken.deleteOne({ _id: existingToken._id });
    const { accessToken, refreshToken } = generateTokens(existingToken.user);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({ token: refreshToken, user: existingToken.user._id, expiresAt });

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ role: existingToken.user.role, isVerified: existingToken.user.isVerified, name: existingToken.user.name });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await RefreshToken.deleteOne({ token });
    }
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: 'User with that email does not exist' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      text: `You are receiving this because you requested a password reset. Please click on the following link: ${resetUrl}`
    });

    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    if (!req.body.password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been successfully reset' });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
