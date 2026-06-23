import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  approveInstructor,
  getMe,
  getUserById,
  listUsers,
  rejectInstructor,
  updateMe,
  updateUserById,
} from '../controllers/userController.js';

const router = Router();

router.get('/me', authenticate, getMe);
router.get('/', authenticate, authorizeRoles('admin', 'instructor'), listUsers);
router.get('/:id', authenticate, authorizeRoles('admin', 'instructor'), getUserById);
router.patch('/me', authenticate, updateMe);
router.post('/:id/approve-instructor', authenticate, authorizeRoles('admin'), approveInstructor);
router.post('/:id/reject-instructor', authenticate, authorizeRoles('admin'), rejectInstructor);
router.patch('/:id', authenticate, authorizeRoles('admin'), updateUserById);

export default router;
