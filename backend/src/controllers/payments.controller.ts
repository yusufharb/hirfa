import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createPaymentRequest, getPaymentStatus, generateSignature } from '../utils/fawry';

export const initiatePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const bookingRes = await pool.query(\`
      SELECT b.*, u.email, u.phone 
      FROM bookings b JOIN users u ON b.customer_id = u.id 
      WHERE b.id = $1 AND b.customer_id = $2\`, [bookingId, req.user.id]);
    
    if (bookingRes.rows.length === 0) return next(new AppError(404, 'Booking not found'));
    
    const booking = bookingRes.rows[0];
    const paymentRes = await pool.query('SELECT * FROM payments WHERE booking_id = $1', [bookingId]);
    if (paymentRes.rows.length === 0) return next(new AppError(404, 'Payment record not found'));
    
    const payment = paymentRes.rows[0];
    if (payment.status === 'paid') return next(new AppError(400, 'Already paid'));

    const fawryResponse = await createPaymentRequest(
      booking.id, 
      parseFloat(payment.amount), 
      booking.email || 'customer@hirfa.com', 
      booking.phone, 
      payment.payment_method
    );

    await pool.query(
      'UPDATE payments SET fawry_merchant_ref = $1 WHERE booking_id = $2',
      [fawryResponse.merchantRefNum, booking.id]
    );

    res.json({ success: true, data: fawryResponse.data });
  } catch (error) {
    next(error);
  }
};

export const fawryWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    
    if (payload.orderStatus === 'PAID') {
      await pool.query(
        \`UPDATE payments SET status = 'paid', fawry_reference_number = $1, paid_at = NOW() WHERE fawry_merchant_ref = $2\`,
        [payload.fawryRefNumber, payload.merchantRefNumber]
      );
    } else if (payload.orderStatus === 'FAILED') {
      await pool.query(
        \`UPDATE payments SET status = 'failed' WHERE fawry_merchant_ref = $1\`,
        [payload.merchantRefNumber]
      );
    }
    
    res.status(200).send('OK');
  } catch (error) {
    next(error);
  }
};

export const checkPaymentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const paymentRes = await pool.query('SELECT * FROM payments WHERE booking_id = $1', [bookingId]);
    if (paymentRes.rows.length === 0) return next(new AppError(404, 'Payment not found'));
    
    const payment = paymentRes.rows[0];
    if (payment.fawry_merchant_ref && payment.status === 'pending') {
      const statusData = await getPaymentStatus(payment.fawry_merchant_ref);
      if (statusData.paymentStatus === 'PAID') {
        await pool.query(
          \`UPDATE payments SET status = 'paid', fawry_reference_number = $1, paid_at = NOW() WHERE booking_id = $2\`,
          [statusData.referenceNumber, bookingId]
        );
        payment.status = 'paid';
      }
    }
    
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const confirmCashPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    
    const bookingRes = await pool.query('SELECT craftsman_id FROM bookings WHERE id = $1', [bookingId]);
    if (bookingRes.rows.length === 0 || bookingRes.rows[0].craftsman_id !== req.user.id) {
      return next(new AppError(403, 'Not authorized'));
    }

    const result = await pool.query(
      \`UPDATE payments SET status = 'paid', paid_at = NOW() WHERE booking_id = $1 AND payment_method = 'cash' RETURNING *\`,
      [bookingId]
    );

    if (result.rows.length === 0) return next(new AppError(400, 'Invalid operation'));
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
