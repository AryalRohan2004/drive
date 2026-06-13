import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { completeLesson, instructorDashboard, learnerDashboard, updateLearnerProgress } from '../controllers/dashboardController.js';

const router = Router();

router.get('/learner', authenticate, authorizeRoles('learner', 'admin'), learnerDashboard);
router.patch('/learner/progress', authenticate, authorizeRoles('learner', 'admin'), updateLearnerProgress);
router.get('/instructor', authenticate, authorizeRoles('instructor', 'admin'), instructorDashboard);
router.post('/instructor/lessons/:id/complete', authenticate, authorizeRoles('instructor', 'admin'), completeLesson);

export default router;
