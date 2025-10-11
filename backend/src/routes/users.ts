import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin only routes
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.post('/', authenticate, authorize('admin'), createUser);

// User routes
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;

