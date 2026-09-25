const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication token is required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hub-productivo-dev-secret');
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = auth;
