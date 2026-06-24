import User from '../models/User.js';
import { generateToken, generateResetToken, verifyToken, generateEmailToken } from '../utils/tokens.js';
import sendEmail from '../config/email.js';
import { verifyEmailTemplate, resetPasswordTemplate } from '../utils/emailTemplates.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Register a new user (role: 'user' only via this route).
 * Sends an email verification link.
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const emailToken = generateEmailToken();
    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken: emailToken,
      emailVerificationExpires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    const verifyUrl = `${CLIENT_URL}/verify-email?token=${emailToken}`;
    await sendEmail({
      to: user.email,
      subject: '🍕 Verify your Pizza Delivery account',
      html: verifyEmailTemplate(user.name, verifyUrl),
      text: `Verify your email: ${verifyUrl}`,
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Verify the email using the token from the URL.
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Login — supports both user and admin.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Forgot password — generates a reset JWT and emails it.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, respond with success even if email doesn't exist
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    const resetToken = generateResetToken(user._id);
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: '🍕 Reset your Pizza Delivery password',
      html: resetPasswordTemplate(user.name, resetUrl),
      text: `Reset your password: ${resetUrl}`,
    });

    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Reset password using the JWT reset token.
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findOne({
      _id: decoded.id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get current logged-in user profile.
 */
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
