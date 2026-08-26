import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT Token
const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'supersecret_clarigo_jwt_key_2026';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '30d',
  });
};

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, role, adminKey } = req.body;

    // Field validations
    if (
      !fullName ||
      !fullName.trim() ||
      !email ||
      !email.trim() ||
      !password ||
      !role
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (!['Admin', 'User'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either Admin or User' });
    }

    // Verify Admin Key for Admin signup
    if (role === 'Admin') {
      const expectedKey = process.env.ADMIN_SIGNUP_KEY || 'admin123';
      if (!adminKey || adminKey.trim() !== expectedKey) {
        return res.status(403).json({ message: 'Invalid or missing Admin Signup Key' });
      }
    }

    // Check duplicate email
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
    });

    if (user) {
      const token = generateToken(user._id, user.role);
      return res.status(201).json({
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Field validations
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check user email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, user.role);
      return res.json({
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      const userObj = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      };
      return res.json({
        user: userObj,
        ...userObj,
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
};
