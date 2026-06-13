import { Router } from 'express';
import { calculateRouteDistance, findNearbyInstructors } from '../controllers/matchingController.js';

const router = Router();

router.get('/nearby', findNearbyInstructors);
router.post('/route-distance', calculateRouteDistance);

export default router;
