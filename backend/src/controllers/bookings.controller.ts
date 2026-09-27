import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { io } from '../server';
import { AuthRequest } from '../middleware/auth';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user.id;
    const { serviceCategoryId, addressId, scheduledType, scheduledAt, problemDescription, paymentMethod, estimatedPrice } = req.body;

    const bookingRes = await pool.query(
      \`INSERT INTO bookings (customer_id, service_category_id, address_id, scheduled_type, scheduled_at, problem_description, estimated_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *\`,
      [customerId, serviceCategoryId, addressId, scheduledType || 'now', scheduledAt, problemDescription, estimatedPrice]
    );
    const booking = bookingRes.rows[0];

    await pool.query(
      \`INSERT INTO payments (booking_id, amount, payment_method) VALUES ($1, $2, $3)\`,
      [booking.id, estimatedPrice, paymentMethod]
    );

    if (booking.scheduled_type === 'now') {
      const addressRes = await pool.query('SELECT lat, lng FROM addresses WHERE id = $1', [addressId]);
      if (addressRes.rows.length > 0) {
        const { lat, lng } = addressRes.rows[0];
        const craftsmenQuery = \`
          SELECT u.id, cp.id as profile_id
          FROM craftsman_profiles cp
          JOIN users u ON cp.user_id = u.id
          JOIN craftsman_skills cs ON cs.craftsman_id = cp.id
          WHERE cs.service_category_id = $3 AND cp.is_available = true
          AND ( 6371 * acos( cos( radians($1) ) * cos( radians( cp.lat ) ) * cos( radians( cp.lng ) - radians($2) ) + sin( radians($1) ) * sin( radians( cp.lat ) ) ) ) < cp.service_area_km
        \`;
        const craftsmenRes = await pool.query(craftsmenQuery, [lat, lng, serviceCategoryId]);
        craftsmenRes.rows.forEach(craftsman => {
          io.to(\`craftsman_\${craftsman.id}\`).emit('new_job_request', { bookingId: booking.id, problemDescription, estimatedPrice, lat, lng });
        });
      }
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    let query = 'SELECT * FROM bookings WHERE customer_id = $1 ORDER BY created_at DESC';
    if (role === 'craftsman') {
      query = 'SELECT * FROM bookings WHERE craftsman_id = $1 ORDER BY created_at DESC';
    }

    const result = await pool.query(query, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getBookingDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const acceptBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const craftsmanId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      \`UPDATE bookings SET status = 'confirmed', craftsman_id = $1, updated_at = NOW() 
       WHERE id = $2 AND status = 'pending' RETURNING *\`,
      [craftsmanId, id]
    );

    if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Booking not available' });

    io.to(\`booking_\${id}\`).emit('booking_accepted', { craftsmanId });
    io.to(\`booking_\${id}\`).emit('booking_status_changed', { status: 'confirmed' });

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const startBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      \`UPDATE bookings SET status = 'in_progress', started_at = NOW(), updated_at = NOW() 
       WHERE id = $1 AND craftsman_id = $2 RETURNING *\`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid operation' });
    io.to(\`booking_\${id}\`).emit('booking_status_changed', { status: 'in_progress' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const completeBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      \`UPDATE bookings SET status = 'completed', completed_at = NOW(), updated_at = NOW() 
       WHERE id = $1 AND craftsman_id = $2 RETURNING *\`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid operation' });
    
    io.to(\`booking_\${id}\`).emit('booking_status_changed', { status: 'completed' });
    io.to(\`booking_\${id}\`).emit('booking_completed', { bookingId: id });
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const cancelledBy = req.user.role === 'customer' ? 'customer' : 'craftsman';

    const result = await pool.query(
      \`UPDATE bookings SET status = 'cancelled', cancellation_reason = $1, cancelled_by = $2, updated_at = NOW() 
       WHERE id = $3 RETURNING *\`,
      [reason, cancelledBy, id]
    );
    if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid operation' });
    io.to(\`booking_\${id}\`).emit('booking_status_changed', { status: 'cancelled', reason, cancelledBy });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const rateBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

    const bookingRes = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    const booking = bookingRes.rows[0];
    if (booking.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only rate completed bookings' });

    const revieweeId = req.user.role === 'customer' ? booking.craftsman_id : booking.customer_id;

    await pool.query(
      'INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment) VALUES ($1, $2, $3, $4, $5)',
      [id, reviewerId, revieweeId, rating, comment]
    );

    if (req.user.role === 'customer') {
      const craftsmanRes = await pool.query('SELECT id, total_reviews, rating FROM craftsman_profiles WHERE user_id = $1', [revieweeId]);
      if (craftsmanRes.rows.length > 0) {
        const p = craftsmanRes.rows[0];
        const newTotal = p.total_reviews + 1;
        const newRating = ((parseFloat(p.rating) * p.total_reviews) + rating) / newTotal;
        await pool.query('UPDATE craftsman_profiles SET rating = $1, total_reviews = $2 WHERE id = $3', [newRating, newTotal, p.id]);
      }
    }

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    next(error);
  }
};
