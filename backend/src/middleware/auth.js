import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { query } from '../config/db.js';

const hydrateUser = async (userId) => {
  const result = await query(
    'SELECT id, full_name, email, phone, role, status, logbook_hours, progress_percent, license_number, service_areas, bio, availability, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
};

export const authenticate = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await hydrateUser(payload.sub);

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const optionalAuthenticate = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await hydrateUser(payload.sub);

    if (!user) {
      return next();
    }

    req.user = user;
    next();
  } catch {
    next();
  }
};

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to access this resource', 403));
  }

  next();
};
