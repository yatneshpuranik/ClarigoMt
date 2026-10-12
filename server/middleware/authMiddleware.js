import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - Verify JWT token with authoritative DB check
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('Server error: JWT_SECRET is not configured');
        return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is missing' });
      }

      const decoded = jwt.verify(token, secret);
      
      // Authoritative database check: read user and role directly from MongoDB
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User account no longer exists or has been removed' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized: token is invalid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized: no Bearer token provided' });
  }
};

// Admin middleware - Require Admin role verified from database
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Administrator role required' });
  }
};
