import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { getMe, getUserById, listUsers, updateMe, updateUserById } from '../controllers/userController.js';

const router = Router();

router.get('/me', authenticate, getMe);
router.get('/', authenticate, authorizeRoles('admin', 'instructor'), listUsers);
router.get('/:id', authenticate, authorizeRoles('admin', 'instructor'), getUserById);
router.patch('/me', authenticate, updateMe);
router.patch('/:id', authenticate, authorizeRoles('admin'), updateUserById);

export default router;
