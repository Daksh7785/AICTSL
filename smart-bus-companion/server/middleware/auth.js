const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (req, res, next) => {
  const token = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const isAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.isVerified) {
      return res.status(403).json({ error: 'Access denied. Admin account must be verified.' });
    }
    next();
  } catch (ex) {
    res.status(500).json({ error: 'Server error during admin verification.' });
  }
};

module.exports = { auth, isAdmin };

// style updates
