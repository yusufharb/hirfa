import { Router } from 'express';
import { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, getNotifications, readAllNotifications } from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

router.get('/notifications', getNotifications);
router.put('/notifications/read-all', readAllNotifications);

export default router;
