import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { createVehicleType, listVehicleTypes, updateVehicleType } from '../controllers/vehicleTypeController.js';

const router = Router();

router.get('/', listVehicleTypes);
router.post('/', authenticate, authorizeRoles('admin'), createVehicleType);
router.patch('/:id', authenticate, authorizeRoles('admin'), updateVehicleType);

export default router;
