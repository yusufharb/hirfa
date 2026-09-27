import { Router } from 'express';
import { createBooking, getMyBookings, getBookingDetails, acceptBooking, startBooking, completeBooking, cancelBooking, rateBooking } from '../controllers/bookings.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', requireRole(['customer']), createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBookingDetails);
router.put('/:id/accept', requireRole(['craftsman']), acceptBooking);
router.put('/:id/start', requireRole(['craftsman']), startBooking);
router.put('/:id/complete', requireRole(['craftsman']), completeBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/rate', rateBooking);

export default router;
