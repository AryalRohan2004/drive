import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadFile } from '../controllers/uploadController.js';

const router = Router();

// Endpoint for uploading files (profile photos, learner documents)
router.post('/', authenticate, upload.single('file'), uploadFile);

// Public endpoint for pre-registration uploads
router.post('/public', upload.single('file'), uploadFile);

export default router;
