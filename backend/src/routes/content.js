import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { createContent, getContentBySlug, listContent, updateContent } from '../controllers/contentController.js';

const router = Router();

router.get('/', listContent);
router.get('/:slug', getContentBySlug);
router.post('/', authenticate, authorizeRoles('admin'), createContent);
router.patch('/:id', authenticate, authorizeRoles('admin'), updateContent);

export default router;
