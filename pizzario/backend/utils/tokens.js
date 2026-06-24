import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateToken = (userId, role = 'user') => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'fallback_dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const generateResetToken = (userId) => {
  return jwt.sign({ id: userId, purpose: 'reset' }, process.env.JWT_SECRET || 'fallback_dev_secret', {
    expiresIn: process.env.JWT_RESET_EXPIRES_IN || '1h',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback_dev_secret');
};

// Random hex token for email verification (alternative to JWT)
export const generateEmailToken = () => crypto.randomBytes(32).toString('hex');
