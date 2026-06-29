import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query, withTransaction } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../services/emailService.js';
import { logAudit } from '../utils/auditLogger.js';

const nameRegex = /^[A-Za-z][A-Za-z\s.'-]{1,59}$/;
const mobileRegex = /^[0-9+\-\s()]{8,15}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,32}$/;
const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;
const abnRegex = /^(\d{2}\s?\d{3}\s?\d{3}\s?\d{3}|\d{11})$/;

const registerSchema = z.object({
  fullName: z.string().min(2).max(60).regex(nameRegex, 'Use letters only, with spaces or basic punctuation.'),
  email: z.string().email(),
  password: z.string().min(8).max(32).regex(passwordRegex, 'Password must include at least one letter and one number.'),
  phone: z.string().trim().regex(mobileRegex, 'Enter a valid phone number with 8 to 15 digits.').optional().nullable(),
  role: z.enum(['learner', 'instructor']).default('learner'),
  languages: z.string().trim().min(2).max(80).optional().nullable(),
  bio: z.string().trim().min(20).max(500).optional().nullable(),
  accreditationNo: z.string().trim().min(4).max(30).optional().nullable(),
  licenseNo: z.string().trim().min(5).max(30).optional().nullable(),
  licenseExpiry: z.string().trim().optional().nullable(),
  suburbsCovered: z.string().trim().min(3).max(120).optional().nullable(),
  daysAvailable: z.string().trim().min(3).max(60).optional().nullable(),
  timesAvailable: z.string().trim().min(3).max(60).optional().nullable(),
  pickupLocations: z.string().trim().min(3).max(120).optional().nullable(),
  vehicleMakeModel: z.string().trim().min(2).max(60).optional().nullable(),
  vehicleTransmission: z.string().trim().optional().nullable(),
  price1Hr: z.union([z.coerce.number().gt(0).lte(1000), z.literal('')]).optional().nullable(),
  price2Hr: z.union([z.coerce.number().gt(0).lte(1000), z.literal('')]).optional().nullable(),
  priceTestPackage: z.union([z.coerce.number().gt(0).lte(1000), z.literal('')]).optional().nullable(),
  specialPackages: z.string().trim().max(120).optional().nullable(),
  bankDetails: z.string().trim().min(6).max(120).optional().nullable(),
  abn: z.string().trim().regex(abnRegex, 'Enter a valid 11-digit ABN.').optional().nullable(),
  yearsExperience: z.union([z.coerce.number().int().min(0).max(80), z.literal('')]).optional().nullable(),
  studentsTaught: z.union([z.coerce.number().int().min(0).max(100000), z.literal('')]).optional().nullable(),
  testimonials: z.string().trim().max(1000).optional().nullable(),
  socialLinks: z.string().trim().regex(urlRegex, 'Enter a valid social profile link.').optional().nullable(),
  agreeCommission: z.boolean().refine(Boolean, 'Please accept the platform commission fee.').optional(),
  agreeTerms: z.boolean().refine(Boolean, 'Please accept the instructor terms and conditions.').optional(),
  agreeCancellation: z.boolean().refine(Boolean, 'Please accept the cancellation policy.').optional(),
  // legacy fields still accepted
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
}).passthrough();

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
  transmission_preference, logbook_hours, progress_percent, learning_status, license_number, service_areas, bio,
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
  learningStatus: row.learning_status,
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
    languages,
    bio,
    accreditationNo,
    licenseNo,
    licenseExpiry,
    suburbsCovered,
    daysAvailable,
    timesAvailable,
    pickupLocations,
    vehicleMakeModel,
    vehicleTransmission,
    price1Hr,
    price2Hr,
    priceTestPackage,
    specialPackages,
    bankDetails,
    abn,
    yearsExperience,
    studentsTaught,
    testimonials,
    socialLinks,
    agreeCommission,
    agreeTerms,
    agreeCancellation,
    // Basic user fields from old schema
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
    // Instructor Profile specific fields
    languagesSpoken,
    profilePhotoUrl,
    accreditationNumber,
    hasWwcc,
    hasPoliceClearance,
    servicesOffered,
    hasDualControl,
    vehiclePhotoUrl,
    testimonialsText,
  } = req.body; // use raw req.body for optional fields to avoid huge schema change for now

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid registration payload', 400);
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rowCount > 0) {
    throw new AppError('Email already in use', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = crypto.randomUUID();
  const result = await withTransaction(async (client) => {
    const insertedUser = await client.query(
      `INSERT INTO users (
        id, full_name, email, phone, password_hash, role, status,
        transmission_preference, preferred_vehicle_type, pickup_address, pickup_suburb, pickup_latitude,
        pickup_longitude, emergency_contact_name, emergency_contact_phone, preferred_lesson_times,
        special_requirements, vehicle_types_supported, base_address, base_latitude, base_longitude, service_radius_km,
        availability
      )
       VALUES (
        $1, $2, $3, $4, $5, $6, $22,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15::jsonb,
        $16, $17::text[], $18, $19, $20, $21,
        '[]'::jsonb
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
        role === 'instructor' ? 'pending' : 'active',
      ]
    );

    if (role === 'instructor') {
      const profileId = crypto.randomUUID();
      await client.query(
        `INSERT INTO instructor_profiles (
          id, user_id, languages_spoken, profile_photo_url, accreditation_number, license_expiry,
          has_wwcc, has_police_clearance, services_offered, days_available, times_available,
          pickup_locations, vehicle_make_model, vehicle_transmission, has_dual_control,
          vehicle_photo_url, price_1hr, price_2hr, price_test_package, special_packages,
          bank_details, abn, years_experience, students_taught, social_links, testimonials_text,
          agreed_commission, agreed_terms, agreed_cancellation
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        )`,
        [
          profileId, userId, languagesSpoken || languages || null, profilePhotoUrl || null,
          accreditationNumber || accreditationNo || null, licenseExpiry || null, hasWwcc || false, hasPoliceClearance || false,
          servicesOffered ? JSON.stringify(servicesOffered) : null, daysAvailable || null, timesAvailable || null,
          pickupLocations || null, vehicleMakeModel || null, vehicleTransmission || null, hasDualControl || false,
          vehiclePhotoUrl || null, price1Hr || null, price2Hr || null, priceTestPackage || null, specialPackages || null,
          bankDetails || null, abn || null, yearsExperience || null, studentsTaught || null, socialLinks || null,
          testimonialsText || testimonials || null, agreeCommission ?? false, agreeTerms ?? false, agreeCancellation ?? false,
        ]
      );
    }

    return insertedUser;
  });

  const user = mapUser(result.rows[0]);
  await logAudit({
    actor: user,
    action: `${role}.registered`,
    entityType: 'user',
    entityId: user.id,
    targetUserId: user.id,
    targetUserRole: role,
    summary: `${role} registered`,
    metadata: { status: user.status, email: user.email },
  });
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

  if (userRow.status === 'pending') {
    throw new AppError('Your account is pending admin approval.', 403);
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
