import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'supersecret_clarigo_jwt_key_2026';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '30d',
  });
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, role, adminKey } = req.body || {};

    if (
      !fullName ||
      typeof fullName !== 'string' ||
      !fullName.trim() ||
      !email ||
      typeof email !== 'string' ||
      !email.trim() ||
      !password ||
      typeof password !== 'string' ||
      !password.trim() ||
      !role ||
      typeof role !== 'string'
    ) {
      return res.status(400).json({ message: 'All fields (fullName, email, password, role) are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (!['Admin', 'User'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either Admin or User' });
    }

    if (role === 'Admin') {
      const serverAdminKey = process.env.ADMIN_SIGNUP_KEY || 'admin123';
      if (!adminKey || typeof adminKey !== 'string' || adminKey.trim() !== serverAdminKey) {
        return res.status(403).json({
          message: 'Invalid or missing Admin Signup Key. Authorized key required to register as Administrator.',
        });
      }
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
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
      return res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      !email ||
      typeof email !== 'string' ||
      !email.trim() ||
      !password ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email: cleanEmail });

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
