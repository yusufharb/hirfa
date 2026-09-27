import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM craftsman_profiles WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bio, serviceAreaKm, bankAccountNumber, bankName } = req.body;
    const result = await pool.query(
      \`UPDATE craftsman_profiles SET bio = $1, service_area_km = $2, bank_account_number = $3, bank_name = $4, updated_at = NOW() WHERE user_id = $5 RETURNING *\`,
      [bio, serviceAreaKm, bankAccountNumber, bankName, req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const toggleAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isAvailable } = req.body;
    const result = await pool.query(
      \`UPDATE craftsman_profiles SET is_available = $1, updated_at = NOW() WHERE user_id = $2 RETURNING is_available\`,
      [isAvailable, req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = req.body;
    const result = await pool.query(
      \`UPDATE craftsman_profiles SET lat = $1, lng = $2, updated_at = NOW() WHERE user_id = $3 RETURNING lat, lng\`,
      [lat, lng, req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getEarnings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      \`SELECT SUM(craftsman_earnings) as total_earnings FROM bookings WHERE craftsman_id = $1 AND status = 'completed'\`,
      [req.user.id]
    );
    res.json({ success: true, data: { total: result.rows[0].total_earnings || 0 } });
  } catch (error) {
    next(error);
  }
};

export const getJobHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      \`SELECT * FROM bookings WHERE craftsman_id = $1 ORDER BY created_at DESC\`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
