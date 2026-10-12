import mongoose from 'mongoose';
import User from '../models/User.js';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
};

// Robust 24-hex-character ObjectId validator
const isValidObjectId = (id) => {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id) && mongoose.Types.ObjectId.isValid(id);
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @desc    Get single user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Server error fetching user' });
  }
};

// @desc    Create a user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body || {};

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
      typeof role !== 'string' ||
      !role.trim()
    ) {
      return res.status(400).json({ message: 'All fields (fullName, email, password, role) are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!['Admin', 'User'].includes(role.trim())) {
      return res.status(400).json({ message: 'Role must be either Admin or User' });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      password,
      role: role.trim(),
    });

    return res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Server error creating user', error: error.message });
  }
};

// @desc    Update user details (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    // Guard against blank or empty payloads
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Payload cannot be empty' });
    }

    const { fullName, email, password, role } = req.body;
    const hasFullName = fullName !== undefined;
    const hasEmail = email !== undefined;
    const hasRole = role !== undefined;
    const hasPassword = password !== undefined && password !== '';

    if (!hasFullName && !hasEmail && !hasRole && !hasPassword) {
      return res.status(400).json({
        message: 'At least one field (fullName, email, password, role) must be provided for update',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent Admin from demoting their own active logged-in account
    if (req.user && req.user._id.toString() === userId && hasRole && role !== 'Admin') {
      return res.status(400).json({
        message: 'You cannot demote your own admin account while logged in',
      });
    }

    // Prevent demoting the last remaining administrator in the system
    if (user.role === 'Admin' && hasRole && role !== 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'Cannot demote the last remaining administrator in the system',
        });
      }
    }

    // Validate and apply fullName
    if (hasFullName) {
      if (typeof fullName !== 'string' || !fullName.trim()) {
        return res.status(400).json({ message: 'Full name cannot be blank' });
      }
      user.fullName = fullName.trim();
    }

    // Validate and apply email
    if (hasEmail) {
      if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ message: 'Email address cannot be blank' });
      }
      const cleanEmail = email.toLowerCase().trim();
      if (!isValidEmail(cleanEmail)) {
        return res.status(400).json({ message: 'Invalid email address' });
      }
      const existingUser = await User.findOne({ email: cleanEmail, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email is already in use by another user' });
      }
      user.email = cleanEmail;
    }

    // Validate and apply role
    if (hasRole) {
      if (typeof role !== 'string' || !['Admin', 'User'].includes(role.trim())) {
        return res.status(400).json({ message: 'Role must be either Admin or User' });
      }
      user.role = role.trim();
    }

    // Validate and apply password
    if (hasPassword) {
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password; // pre-save hook will hash password cleanly
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Server error updating user', error: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    // Prevent active Admin from deleting themselves
    if (req.user && req.user._id.toString() === userId) {
      return res.status(400).json({
        message: 'You cannot delete your own admin account while logged in',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last remaining administrator in the system
    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'Cannot delete the last remaining administrator in the system',
        });
      }
    }

    await User.findByIdAndDelete(userId);
    return res.json({ message: 'User deleted successfully', id: userId });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Server error deleting user' });
  }
};

