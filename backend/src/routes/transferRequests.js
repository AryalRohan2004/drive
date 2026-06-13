import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { approveTransferRequest, completeTransferRequest, getTransferRequestById, listTransferRequests, rejectTransferRequest } from '../controllers/assignmentController.js';

const router = Router();

router.get('/', authenticate, listTransferRequests);
router.get('/:id', authenticate, getTransferRequestById);
router.post('/:id/approve', authenticate, authorizeRoles('instructor', 'admin'), approveTransferRequest);
router.post('/:id/reject', authenticate, authorizeRoles('instructor', 'admin'), rejectTransferRequest);
router.post('/:id/complete', authenticate, completeTransferRequest);

export default router;
