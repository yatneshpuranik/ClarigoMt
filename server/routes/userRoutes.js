import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user management routes require JWT authentication and Admin role
router.use(protect, adminOnly);

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;
