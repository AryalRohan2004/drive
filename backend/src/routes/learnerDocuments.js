import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { createLearnerDocument, getMyLearnerDocuments, updateLearnerDocumentStatus } from '../controllers/learnerDocumentController.js';

const router = Router();

router.post('/', authenticate, authorizeRoles('learner', 'admin'), createLearnerDocument);
router.get('/me', authenticate, authorizeRoles('learner', 'admin'), getMyLearnerDocuments);
router.patch('/:id/status', authenticate, authorizeRoles('admin', 'instructor'), updateLearnerDocumentStatus);

export default router;
