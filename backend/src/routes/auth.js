import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { forgotPassword, login, logout, me, register, resetPassword } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, me);

export default router;
