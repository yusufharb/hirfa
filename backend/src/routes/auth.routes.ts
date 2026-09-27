import { Router } from 'express';
import { sendOtpController, verifyOtpController, refreshTokenController, logoutController, getMeController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.post('/send-otp', [
  body('phone').notEmpty().withMessage('Phone is required')
], validateRequest, sendOtpController);

router.post('/verify-otp', [
  body('phone').notEmpty(),
  body('code').notEmpty()
], validateRequest, verifyOtpController);

router.post('/refresh-token', refreshTokenController);
router.post('/logout', authenticateToken, logoutController);
router.get('/me', authenticateToken, getMeController);

export default router;
