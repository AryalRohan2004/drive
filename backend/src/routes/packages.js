import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { createPackage, deletePackage, getPackageByCode, listPackages, updatePackage } from '../controllers/packageController.js';

const router = Router();

router.get('/', listPackages);
router.get('/:code', getPackageByCode);
router.post('/', authenticate, authorizeRoles('admin'), createPackage);
router.patch('/:id', authenticate, authorizeRoles('admin'), updatePackage);
router.delete('/:id', authenticate, authorizeRoles('admin'), deletePackage);

export default router;
