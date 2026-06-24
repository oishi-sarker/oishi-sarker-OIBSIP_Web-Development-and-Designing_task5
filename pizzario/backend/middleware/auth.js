import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes — requires a valid Bearer JWT.
 * Attaches req.user (without password) on success.
 */
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_dev_secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

/**
 * Require admin role.
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
};

/**
 * Require email-verified account.
 */
export const requireVerifiedEmail = (req, res, next) => {
  if (req.user && req.user.isEmailVerified) return next();
  return res.status(403).json({ message: 'Please verify your email address first', needsVerification: true });
};
