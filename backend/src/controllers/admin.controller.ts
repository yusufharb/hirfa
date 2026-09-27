import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usersCount = await pool.query(\`SELECT COUNT(*) FROM users WHERE role = 'customer'\`);
    const craftsmenCount = await pool.query(\`SELECT COUNT(*) FROM users WHERE role = 'craftsman'\`);
    const bookingsToday = await pool.query(\`SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE\`);
    const revenueToday = await pool.query(\`SELECT SUM(platform_fee) FROM bookings WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'\`);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(usersCount.rows[0].count),
        totalCraftsmen: parseInt(craftsmenCount.rows[0].count),
        bookingsToday: parseInt(bookingsToday.rows[0].count),
        revenueToday: revenueToday.rows[0].sum || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT id, name, phone, email, role, is_active, created_at FROM users WHERE 1=1';
    const params: any[] = [];
    
    if (role) {
      params.push(role);
      query += \` AND role = $\${params.length}\`;
    }
    
    if (search) {
      params.push(\`%\${search}%\`);
      query += \` AND (name ILIKE $\${params.length} OR phone ILIKE $\${params.length})\`;
    }
    
    query += \` ORDER BY created_at DESC LIMIT $\${params.length + 1} OFFSET $\${params.length + 2}\`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getCraftsmenList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, verified } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = \`
      SELECT u.id, u.name, u.phone, cp.national_id_number, cp.national_id_verified, cp.rating 
      FROM users u JOIN craftsman_profiles cp ON u.id = cp.user_id WHERE u.role = 'craftsman'
    \`;
    const params: any[] = [];
    
    if (verified !== undefined) {
      params.push(verified === 'true');
      query += \` AND cp.national_id_verified = $\${params.length}\`;
    }
    
    query += \` ORDER BY u.created_at DESC LIMIT $\${params.length + 1} OFFSET $\${params.length + 2}\`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const verifyCraftsman = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      \`UPDATE craftsman_profiles SET national_id_verified = true, updated_at = NOW() WHERE user_id = $1 RETURNING *\`,
      [id]
    );
    if (result.rows.length === 0) return next(new AppError(404, 'Craftsman not found'));
    res.json({ success: true, message: 'Craftsman verified successfully', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getBookingsManagement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params: any[] = [];
    
    if (status) {
      params.push(status);
      query += \` AND status = $\${params.length}\`;
    }
    
    if (date) {
      params.push(date);
      query += \` AND DATE(created_at) = $\${params.length}\`;
    }
    
    query += \` ORDER BY created_at DESC LIMIT $\${params.length + 1} OFFSET $\${params.length + 2}\`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getBookingDetailsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const resolveDispute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    const result = await pool.query(
      \`UPDATE bookings SET status = 'cancelled', cancellation_reason = $1, cancelled_by = 'system', updated_at = NOW() WHERE id = $2 RETURNING *\`,
      [resolution, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getRevenueReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query;
    const result = await pool.query(
      \`SELECT SUM(platform_fee) as total_revenue FROM bookings WHERE status = 'completed' AND created_at >= $1 AND created_at <= $2\`,
      [from, to]
    );
    res.json({ success: true, data: { revenue: result.rows[0].total_revenue || 0 } });
  } catch (error) {
    next(error);
  }
};
