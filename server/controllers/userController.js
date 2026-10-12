import mongoose from 'mongoose';
import User from '../models/User.js';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
};

const isValidObjectId = (id) => {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id) && mongoose.Types.ObjectId.isValid(id);
};

const isSuperAdminRole = (role) => role === 'Super Admin' || role === 'SuperAdmin';
const isAdminRole = (role) => role === 'Admin' || isSuperAdminRole(role);

export const getUsers = async (req, res) => {
  try {
    const caller = req.user;
    const isCallerSuperAdmin = isSuperAdminRole(caller?.role);

    const query = {};
    if (!isCallerSuperAdmin) {
      query.role = 'User';
    } else if (req.query.role && ['Admin', 'User', 'Super Admin', 'SuperAdmin'].includes(req.query.role)) {
      query.role = req.query.role;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error fetching users' });
  }
};

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

    const caller = req.user;
    const isCallerSuperAdmin = isSuperAdminRole(caller?.role);
    if (!isCallerSuperAdmin && user.role !== 'User') {
      return res.status(403).json({ message: 'Forbidden: Admins cannot access Admin or Super Admin details' });
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

    const cleanRole = role.trim();
    if (!['Admin', 'User', 'Super Admin', 'SuperAdmin'].includes(cleanRole)) {
      return res.status(400).json({ message: 'Role must be Admin, Super Admin, or User' });
    }

    const caller = req.user;
    const isCallerSuperAdmin = isSuperAdminRole(caller?.role);
    if (!isCallerSuperAdmin && cleanRole !== 'User') {
      return res.status(403).json({ message: 'Forbidden: Admins cannot create Admin or Super Admin accounts' });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      password,
      role: cleanRole,
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

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

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

    const caller = req.user;
    const isCallerSuperAdmin = isSuperAdminRole(caller?.role);

    if (!isCallerSuperAdmin && user.role !== 'User') {
      return res.status(403).json({ message: 'Forbidden: Admins cannot modify Admin or Super Admin accounts' });
    }

    if (
      caller &&
      (caller._id.toString() === userId || caller.email?.toLowerCase() === user.email?.toLowerCase()) &&
      hasRole &&
      !isAdminRole(role)
    ) {
      return res.status(400).json({
        message: 'You cannot demote your own admin account while logged in',
      });
    }

    if (!isCallerSuperAdmin && hasRole && role !== 'User') {
      return res.status(403).json({
        message: 'Forbidden: Admins cannot promote users to Admin or Super Admin',
      });
    }

    if (user.role === 'Admin' && hasRole && role !== 'Admin') {
      const adminCount = await User.countDocuments({ role: { $in: ['Admin', 'Super Admin', 'SuperAdmin'] } });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'Cannot demote the last remaining administrator in the system',
        });
      }
    }

    if (hasFullName) {
      if (typeof fullName !== 'string' || !fullName.trim()) {
        return res.status(400).json({ message: 'Full name cannot be blank' });
      }
      user.fullName = fullName.trim();
    }

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

    if (hasRole) {
      const cleanRole = role.trim();
      if (!['Admin', 'User', 'Super Admin', 'SuperAdmin'].includes(cleanRole)) {
        return res.status(400).json({ message: 'Role must be Admin, Super Admin, or User' });
      }
      user.role = cleanRole;
    }

    if (hasPassword) {
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password;
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

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const caller = req.user;
    const isCallerSuperAdmin = isSuperAdminRole(caller?.role);

    if (
      caller &&
      (caller._id.toString() === userId || caller.email?.toLowerCase() === user.email?.toLowerCase())
    ) {
      return res.status(400).json({
        message: 'You cannot delete your own admin account while logged in',
      });
    }

    if (!isCallerSuperAdmin && user.role !== 'User') {
      return res.status(403).json({
        message: 'Forbidden: Admins cannot delete Admin or Super Admin accounts',
      });
    }

    if (isSuperAdminRole(user.role)) {
      const superAdminCount = await User.countDocuments({ role: { $in: ['Super Admin', 'SuperAdmin'] } });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          message: 'Cannot delete the last remaining Super Admin in the system',
        });
      }
    } else if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: { $in: ['Admin', 'Super Admin', 'SuperAdmin'] } });
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
