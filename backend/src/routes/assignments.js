import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { createTransferRequest, getMyAssignments, listTransferRequests } from '../controllers/assignmentController.js';

const router = Router();

router.get('/me', authenticate, getMyAssignments);
router.post('/:id/transfer-request', authenticate, authorizeRoles('learner', 'admin'), createTransferRequest);
router.get('/transfer-requests', authenticate, listTransferRequests);

export default router;
