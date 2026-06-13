import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../services/emailService.js';

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional().nullable(),
  role: z.enum(['learner', 'instructor']).default('learner'),
  transmissionPreference: z.string().optional().nullable(),
  preferredVehicleType: z.string().optional().nullable(),
  pickupSuburb: z.string().optional().nullable(),
  pickupAddress: z.string().optional().nullable(),
  pickupLatitude: z.coerce.number().optional().nullable(),
  pickupLongitude: z.coerce.number().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  preferredLessonTimes: z.array(z.any()).optional(),
  specialRequirements: z.string().optional().nullable(),
  vehicleTypesSupported: z.array(z.string()).optional(),
  baseAddress: z.string().optional().nullable(),
  baseLatitude: z.coerce.number().optional().nullable(),
  baseLongitude: z.coerce.number().optional().nullable(),
  serviceRadiusKm: z.coerce.number().int().min(0).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

const userSelect = `
  id, full_name, email, phone, role, status,
  date_of_birth, address, suburb, postcode, license_type,
  transmission_preference, logbook_hours, progress_percent, license_number, service_areas, bio,
  availability, preferred_vehicle_type, pickup_address, pickup_suburb,
  pickup_latitude, pickup_longitude, emergency_contact_name, emergency_contact_phone,
  preferred_lesson_times, special_requirements, documentation_status, vehicle_types_supported,
  base_address, base_latitude, base_longitude, service_radius_km, max_travel_distance_km, created_at, updated_at
`;

const mapUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  role: row.role,
  status: row.status,
  dateOfBirth: row.date_of_birth,
  address: row.address,
  suburb: row.suburb,
  postcode: row.postcode,
  licenseType: row.license_type,
  transmissionPreference: row.transmission_preference,
  logbookHours: row.logbook_hours,
  progressPercent: row.progress_percent,
  licenseNumber: row.license_number,
  serviceAreas: row.service_areas || [],
  bio: row.bio,
  availability: row.availability || [],
  preferredVehicleType: row.preferred_vehicle_type,
  pickupAddress: row.pickup_address,
  pickupSuburb: row.pickup_suburb,
  pickupLatitude: row.pickup_latitude,
  pickupLongitude: row.pickup_longitude,
  emergencyContactName: row.emergency_contact_name,
  emergencyContactPhone: row.emergency_contact_phone,
  preferredLessonTimes: row.preferred_lesson_times || [],
  specialRequirements: row.special_requirements,
  documentationStatus: row.documentation_status,
  vehicleTypesSupported: row.vehicle_types_supported || [],
  baseAddress: row.base_address,
  baseLatitude: row.base_latitude,
  baseLongitude: row.base_longitude,
  serviceRadiusKm: row.service_radius_km,
  maxTravelDistanceKm: row.max_travel_distance_km,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const signToken = (userId, role) =>
  jwt.sign({ role }, env.jwtSecret, { subject: userId, expiresIn: env.jwtExpiresIn });

export const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid registration payload', 400);
  }

  const {
    fullName,
    email,
    password,
    phone,
    role,
    transmissionPreference,
    preferredVehicleType,
    pickupSuburb,
    pickupAddress,
    pickupLatitude,
    pickupLongitude,
    emergencyContactName,
    emergencyContactPhone,
    preferredLessonTimes,
    specialRequirements,
    vehicleTypesSupported,
    baseAddress,
    baseLatitude,
    baseLongitude,
    serviceRadiusKm,
  } = parsed.data;
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rowCount > 0) {
    throw new AppError('Email already in use', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = crypto.randomUUID();
  const result = await query(
    `INSERT INTO users (
      id, full_name, email, phone, password_hash, role, status,
      transmission_preference, preferred_vehicle_type, pickup_address, pickup_suburb, pickup_latitude,
      pickup_longitude, emergency_contact_name, emergency_contact_phone, preferred_lesson_times,
      special_requirements, vehicle_types_supported, base_address, base_latitude, base_longitude, service_radius_km
    )
     VALUES (
      $1, $2, $3, $4, $5, $6, 'active',
      $7, $8, $9, $10, $11,
      $12, $13, $14, $15::jsonb,
      $16, $17::text[], $18, $19, $20, $21
    )
     RETURNING ${userSelect}`,
    [
      userId,
      fullName,
      email.toLowerCase(),
      phone || null,
      passwordHash,
      role,
      transmissionPreference || null,
      preferredVehicleType || null,
      pickupAddress || null,
      pickupSuburb || null,
      pickupLatitude ?? null,
      pickupLongitude ?? null,
      emergencyContactName || null,
      emergencyContactPhone || null,
      JSON.stringify(preferredLessonTimes || []),
      specialRequirements || null,
      vehicleTypesSupported || [],
      baseAddress || null,
      baseLatitude ?? null,
      baseLongitude ?? null,
      serviceRadiusKm ?? 25,
    ]
  );

  const user = mapUser(result.rows[0]);
  const token = signToken(user.id, user.role);

  res.status(201).json({ user, accessToken: token });
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid login payload', 400);
  }

  const { email, password } = parsed.data;
  const result = await query(
    `SELECT ${userSelect}, password_hash FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rowCount === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const userRow = result.rows[0];
  const ok = await bcrypt.compare(password, userRow.password_hash);
  if (!ok) {
    throw new AppError('Invalid email or password', 401);
  }

  if (userRow.status !== 'active') {
    throw new AppError('Account is not active', 403);
  }

  const user = mapUser(userRow);
  const token = signToken(user.id, user.role);

  res.json({ user, accessToken: token });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: mapUser(req.user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid email', 400);
  }

  const { email } = parsed.data;
  const userResult = await query('SELECT id, full_name, email FROM users WHERE email = $1', [email.toLowerCase()]);

  if (userResult.rowCount === 0) {
    return res.json({ message: 'If the account exists, a reset link will be sent shortly.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
  const resetId = crypto.randomUUID();

  await query(
    `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [resetId, userResult.rows[0].id, tokenHash, expiresAt.toISOString()]
  );

  const resetLink = `${env.frontendUrl}/reset-password?token=${token}`;
  await sendEmail({
    to: userResult.rows[0].email,
    subject: 'Reset your SANOS Driving School password',
    text: `Hello ${userResult.rows[0].full_name}, use this link to reset your password: ${resetLink}`,
    html: `<p>Hello ${userResult.rows[0].full_name},</p><p>Use this link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });

  res.json({
    message: 'If the account exists, a reset link will be sent shortly.',
    resetToken: env.nodeEnv === 'production' ? undefined : token,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid reset payload', 400);
  }

  const { token, password } = parsed.data;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const tokenResult = await query(
    `SELECT id, user_id, expires_at, used_at
     FROM password_reset_tokens
     WHERE token_hash = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [tokenHash]
  );

  if (tokenResult.rowCount === 0) {
    throw new AppError('Reset token is invalid or expired', 400);
  }

  const resetRow = tokenResult.rows[0];
  if (resetRow.used_at) {
    throw new AppError('Reset token has already been used', 400);
  }

  if (new Date(resetRow.expires_at).getTime() < Date.now()) {
    throw new AppError('Reset token is invalid or expired', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
    passwordHash,
    resetRow.user_id,
  ]);
  await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [resetRow.id]);

  res.json({ message: 'Password reset successful' });
});

export const logout = asyncHandler(async (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});
