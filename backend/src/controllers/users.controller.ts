import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT id, name, phone, email, profile_photo_url, role, is_verified FROM users WHERE id = $1', [req.user.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, profilePhotoUrl } = req.body;
    const result = await pool.query(
      \`UPDATE users SET name = $1, email = $2, profile_photo_url = $3, updated_at = NOW() WHERE id = $4 RETURNING id, name, email, profile_photo_url\`,
      [name, email, profilePhotoUrl, req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getAddresses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM addresses WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { label, addressLine1, addressLine2, city, district, lat, lng, isDefault } = req.body;
    
    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const result = await pool.query(
      \`INSERT INTO addresses (user_id, label, address_line1, address_line2, city, district, lat, lng, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *\`,
      [req.user.id, label, addressLine1, addressLine2, city, district, lat, lng, isDefault || false]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { label, addressLine1, addressLine2, city, district, lat, lng, isDefault } = req.body;

    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const result = await pool.query(
      \`UPDATE addresses SET label = $1, address_line1 = $2, address_line2 = $3, city = $4, district = $5, lat = $6, lng = $7, is_default = $8 WHERE id = $9 AND user_id = $10 RETURNING *\`,
      [label, addressLine1, addressLine2, city, district, lat, lng, isDefault, id, req.user.id]
    );

    if (result.rows.length === 0) return next(new AppError(404, 'Address not found'));
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) return next(new AppError(404, 'Address not found'));
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const readAllNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await pool.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
