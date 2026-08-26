import mongoose from 'mongoose';
import User from '../models/User.js';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper to check valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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

// @desc    Create a user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !fullName.trim() || !email || !email.trim() || !password || !role) {
      return res.status(400).json({ message: 'All fields (fullName, email, password, role) are required' });
    }

    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!['Admin', 'User'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either Admin or User' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
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
    const { fullName, email, password, role } = req.body;
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    // Prevent Admin from demoting their own logged-in account
    if (req.user && req.user._id.toString() === userId && role && role !== 'Admin') {
      return res.status(400).json({ message: 'You cannot demote your own admin account while logged in' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) {
      if (!fullName.trim()) {
        return res.status(400).json({ message: 'Full name cannot be empty' });
      }
      user.fullName = fullName.trim();
    }

    if (email) {
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

    if (role) {
      if (!['Admin', 'User'].includes(role)) {
        return res.status(400).json({ message: 'Role must be either Admin or User' });
      }
      user.role = role;
    }

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password; // pre-save hook will hash password
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
      return res.status(400).json({ message: 'You cannot delete your own admin account while logged in' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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

