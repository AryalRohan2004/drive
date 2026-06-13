import { Router } from 'express';
import { findNearbyInstructors } from '../controllers/matchingController.js';

const router = Router();

router.get('/nearby', findNearbyInstructors);

export default router;
