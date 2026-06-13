import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { acceptTrainingRequest, createTrainingRequest, getTrainingRequestById, listTrainingRequests, moreInfoTrainingRequest, rejectTrainingRequest } from '../controllers/trainingRequestController.js';

const router = Router();

router.get('/', authenticate, listTrainingRequests);
router.get('/:id', authenticate, getTrainingRequestById);
router.post('/', authenticate, authorizeRoles('learner', 'admin'), createTrainingRequest);
router.post('/:id/accept', authenticate, authorizeRoles('instructor', 'admin'), acceptTrainingRequest);
router.post('/:id/reject', authenticate, authorizeRoles('instructor', 'admin'), rejectTrainingRequest);
router.post('/:id/more-info', authenticate, authorizeRoles('instructor', 'admin'), moreInfoTrainingRequest);

export default router;
