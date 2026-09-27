import { Router } from 'express';
import { initiatePayment, fawryWebhook, checkPaymentStatus, confirmCashPayment } from '../controllers/payments.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.post('/webhook', fawryWebhook);
router.post('/initiate/:bookingId', authenticateToken, requireRole(['customer']), initiatePayment);
router.get('/:bookingId', authenticateToken, checkPaymentStatus);
router.post('/cash-confirm/:bookingId', authenticateToken, requireRole(['craftsman']), confirmCashPayment);

export default router;
