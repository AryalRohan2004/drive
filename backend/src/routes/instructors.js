import { Router } from 'express';
import { listActiveInstructors } from '../controllers/instructorController.js';
import { findNearbyInstructors } from '../controllers/matchingController.js';

const router = Router();

// Public — active instructors list (used by booking wizard)
router.get('/', listActiveInstructors);

// Public — geolocation-sorted nearby instructors
router.get('/nearby', findNearbyInstructors);

export default router;

