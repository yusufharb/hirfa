import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM service_categories WHERE is_active = true ORDER BY sort_order ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM service_categories WHERE id = $1 AND is_active = true', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getCraftsmenForService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query;

    let query = \`
      SELECT * FROM (
        SELECT u.id, u.name, u.profile_photo_url, cp.rating, cp.total_reviews, cp.lat, cp.lng, cp.service_area_km,
        ( 6371 * acos( cos( radians($1) ) * cos( radians( cp.lat ) ) * cos( radians( cp.lng ) - radians($2) ) + sin( radians($1) ) * sin( radians( cp.lat ) ) ) ) AS distance
        FROM craftsman_profiles cp
        JOIN users u ON cp.user_id = u.id
        JOIN craftsman_skills cs ON cs.craftsman_id = cp.id
        WHERE cs.service_category_id = $3 AND cp.is_available = true AND u.is_active = true
      ) AS sq
      WHERE distance < service_area_km
      ORDER BY distance ASC
    \`;

    if (!lat || !lng) {
      query = \`
        SELECT u.id, u.name, u.profile_photo_url, cp.rating, cp.total_reviews 
        FROM craftsman_profiles cp
        JOIN users u ON cp.user_id = u.id
        JOIN craftsman_skills cs ON cs.craftsman_id = cp.id
        WHERE cs.service_category_id = $1 AND cp.is_available = true AND u.is_active = true
      \`;
      const result = await pool.query(query, [id]);
      return res.json({ success: true, data: result.rows });
    }

    const result = await pool.query(query, [lat, lng, id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
