import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { listContactRequests, submitContact, updateContactRequest } from '../controllers/contactController.js';

const router = Router();

router.post('/', submitContact);
router.get('/', authenticate, authorizeRoles('admin'), listContactRequests);
router.patch('/:id', authenticate, authorizeRoles('admin'), updateContactRequest);

export default router;
