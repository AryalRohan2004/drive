import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { cancelBooking, confirmBooking, createBooking, getBookingById, listBookings, updateBooking } from '../controllers/bookingController.js';

const router = Router();

router.get('/', authenticate, listBookings);
router.post('/', authenticate, authorizeRoles('learner', 'admin'), createBooking);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id', authenticate, authorizeRoles('admin', 'instructor'), updateBooking);
router.post('/:id/confirm', authenticate, authorizeRoles('admin', 'instructor'), confirmBooking);
router.post('/:id/cancel', authenticate, cancelBooking);

export default router;
