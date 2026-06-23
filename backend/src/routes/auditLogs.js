import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { listAuditLogs } from '../controllers/auditLogController.js';

const router = Router();

router.get('/', authenticate, authorizeRoles('admin'), listAuditLogs);

export default router;
