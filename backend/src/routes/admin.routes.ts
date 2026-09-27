import { Router } from 'express';
import { 
  getDashboardStats, 
  getUsersList, 
  getCraftsmenList, 
  verifyCraftsman, 
  getBookingsManagement, 
  getBookingDetailsAdmin, 
  resolveDispute, 
  getRevenueReport 
} from '../controllers/admin.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['admin']));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsersList);
router.get('/craftsmen', getCraftsmenList);
router.put('/craftsmen/:id/verify', verifyCraftsman);
router.get('/bookings', getBookingsManagement);
router.get('/bookings/:id', getBookingDetailsAdmin);
router.put('/bookings/:id/dispute', resolveDispute);
router.get('/revenue', getRevenueReport);

export default router;
