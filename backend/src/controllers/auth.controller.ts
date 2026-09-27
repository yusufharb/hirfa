import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateOTP, sendSMS, saveOTP, verifyOTP } from '../utils/otp';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export const sendOtpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return next(new AppError(400, 'Phone number is required'));
    }

    const code = generateOTP();
    await saveOTP(phone, code);
    await sendSMS(phone, \`Your HIRFA verification code is \${code}\`);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, code, name, role } = req.body;
    if (!phone || !code) {
      return next(new AppError(400, 'Phone and code are required'));
    }

    const isValid = await verifyOTP(phone, code);
    if (!isValid) {
      return next(new AppError(400, 'Invalid or expired OTP'));
    }

    // Check if user exists
    let userRes = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    let user;
    let isNewUser = false;

    if (userRes.rows.length === 0) {
      // Create user
      const assignedRole = role === 'craftsman' ? 'craftsman' : 'customer';
      const newUser = await pool.query(
        'INSERT INTO users (phone, name, role, is_verified) VALUES ($1, $2, $3, true) RETURNING *',
        [phone, name || 'User', assignedRole]
      );
      user = newUser.rows[0];
      isNewUser = true;

      if (assignedRole === 'craftsman') {
        await pool.query('INSERT INTO craftsman_profiles (user_id) VALUES ($1)', [user.id]);
      }
    } else {
      user = userRes.rows[0];
      if (!user.is_active) {
        return next(new AppError(403, 'Account is deactivated'));
      }
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
        isNewUser
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError(401, 'Refresh token required'));
    }

    const decoded = verifyRefreshToken(refreshToken) as any;
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    
    if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
      return next(new AppError(403, 'Invalid user'));
    }

    const newAccessToken = generateAccessToken(userRes.rows[0].id, userRes.rows[0].role);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    next(new AppError(403, 'Invalid or expired refresh token'));
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  // In a real app, you might want to blacklist the refresh token in Redis
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMeController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const userRes = await pool.query('SELECT id, name, phone, email, profile_photo_url, role, is_verified FROM users WHERE id = $1', [userId]);
    
    if (userRes.rows.length === 0) {
      return next(new AppError(404, 'User not found'));
    }
    
    let profile = userRes.rows[0];
    
    if (profile.role === 'craftsman') {
      const craftsmanRes = await pool.query('SELECT * FROM craftsman_profiles WHERE user_id = $1', [userId]);
      if (craftsmanRes.rows.length > 0) {
        profile = { ...profile, craftsmanDetails: craftsmanRes.rows[0] };
      }
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
