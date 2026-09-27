import { Router } from 'express';
import { getProfile, updateProfile, toggleAvailability, updateLocation, getEarnings, getJobHistory } from '../controllers/craftsmen.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['craftsman']));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/availability', toggleAvailability);
router.put('/location', updateLocation);
router.get('/earnings', getEarnings);
router.get('/jobs', getJobHistory);

export default router;
