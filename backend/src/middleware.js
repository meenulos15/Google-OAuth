// e:/task/backend/src/middleware.js
const { verifyAccessToken } = require('./auth');
const db = require('./db');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }

  req.user = db.findUserById(payload.id);
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }

  next();
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
