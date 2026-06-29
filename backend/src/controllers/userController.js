import { z } from 'zod';
import { query } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logAudit } from '../utils/auditLogger.js';

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  role: z.enum(['learner', 'instructor', 'admin']).optional(),
  status: z.enum(['pending', 'active', 'rejected']).optional(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().date().optional().nullable(),
  address: z.string().optional().nullable(),
  suburb: z.string().optional().nullable(),
  postcode: z.string().optional().nullable(),
  licenseType: z.string().optional().nullable(),
  transmissionPreference: z.string().optional().nullable(),
  logbookHours: z.coerce.number().int().min(0).optional(),
  progressPercent: z.coerce.number().int().min(0).max(100).optional(),
  learningStatus: z.enum(['not_started', 'active', 'paused', 'transferred', 'completed']).optional(),
  licenseNumber: z.string().optional().nullable(),
  serviceAreas: z.array(z.string()).optional(),
  bio: z.string().optional().nullable(),
  availability: z.array(z.any()).optional(),
  preferredVehicleType: z.string().optional().nullable(),
  pickupAddress: z.string().optional().nullable(),
  pickupSuburb: z.string().optional().nullable(),
  pickupLatitude: z.coerce.number().optional().nullable(),
  pickupLongitude: z.coerce.number().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  preferredLessonTimes: z.array(z.any()).optional(),
  specialRequirements: z.string().optional().nullable(),
  documentationStatus: z.string().optional().nullable(),
  vehicleTypesSupported: z.array(z.string()).optional(),
  baseAddress: z.string().optional().nullable(),
  baseLatitude: z.coerce.number().optional().nullable(),
  baseLongitude: z.coerce.number().optional().nullable(),
  serviceRadiusKm: z.coerce.number().int().min(0).optional(),
  maxTravelDistanceKm: z.coerce.number().int().min(0).optional(),
});

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
  instructorProfile: row.instructor_profile
    ? row.instructor_profile
    : row.instructor_profile_id || row.languages_spoken || row.accreditation_number
      ? {
          id: row.instructor_profile_id,
          userId: row.user_id,
          languagesSpoken: row.languages_spoken,
          profilePhotoUrl: row.profile_photo_url,
          accreditationNumber: row.accreditation_number,
          licenseExpiry: row.license_expiry,
          hasWwcc: row.has_wwcc,
          hasPoliceClearance: row.has_police_clearance,
          servicesOffered: row.services_offered,
          daysAvailable: row.days_available,
          timesAvailable: row.times_available,
          pickupLocations: row.pickup_locations,
          vehicleMakeModel: row.vehicle_make_model,
          vehicleTransmission: row.vehicle_transmission,
          hasDualControl: row.has_dual_control,
          vehiclePhotoUrl: row.vehicle_photo_url,
          price1Hr: row.price_1hr,
          price2Hr: row.price_2hr,
          priceTestPackage: row.price_test_package,
          specialPackages: row.special_packages,
          bankDetails: row.bank_details,
          abn: row.abn,
          yearsExperience: row.years_experience,
          studentsTaught: row.students_taught,
          socialLinks: row.social_links,
          testimonialsText: row.testimonials_text,
          agreedCommission: row.agreed_commission,
          agreedTerms: row.agreed_terms,
          agreedCancellation: row.agreed_cancellation,
          createdAt: row.instructor_created_at,
          updatedAt: row.instructor_updated_at,
        }
      : null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const updateFieldConfig = {
  fullName: { column: 'full_name' },
  role: { column: 'role' },
  status: { column: 'status' },
  phone: { column: 'phone' },
  dateOfBirth: { column: 'date_of_birth' },
  address: { column: 'address' },
  suburb: { column: 'suburb' },
  postcode: { column: 'postcode' },
  licenseType: { column: 'license_type' },
  transmissionPreference: { column: 'transmission_preference' },
  logbookHours: { column: 'logbook_hours' },
  progressPercent: { column: 'progress_percent' },
  learningStatus: { column: 'learning_status' },
  licenseNumber: { column: 'license_number' },
  serviceAreas: { column: 'service_areas', cast: '::text[]' },
  bio: { column: 'bio' },
  availability: { column: 'availability', cast: '::jsonb', serialize: JSON.stringify },
  preferredVehicleType: { column: 'preferred_vehicle_type' },
  pickupAddress: { column: 'pickup_address' },
  pickupSuburb: { column: 'pickup_suburb' },
  pickupLatitude: { column: 'pickup_latitude' },
  pickupLongitude: { column: 'pickup_longitude' },
  emergencyContactName: { column: 'emergency_contact_name' },
  emergencyContactPhone: { column: 'emergency_contact_phone' },
  preferredLessonTimes: { column: 'preferred_lesson_times', cast: '::jsonb', serialize: JSON.stringify },
  specialRequirements: { column: 'special_requirements' },
  documentationStatus: { column: 'documentation_status' },
  vehicleTypesSupported: { column: 'vehicle_types_supported', cast: '::text[]' },
  baseAddress: { column: 'base_address' },
  baseLatitude: { column: 'base_latitude' },
  baseLongitude: { column: 'base_longitude' },
  serviceRadiusKm: { column: 'service_radius_km' },
  maxTravelDistanceKm: { column: 'max_travel_distance_km' },
};

const buildUpdateFragments = (payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(payload)) {
    const config = updateFieldConfig[key];
    if (!config) {
      continue;
    }

    fields.push(`${config.column} = $${idx++}${config.cast || ''}`);
    values.push(config.serialize ? config.serialize(value) : value);
  }

  return { fields, values };
};

export const listUsers = asyncHandler(async (req, res) => {
  const filters = [];
  const values = [];
  let idx = 1;

  if (req.query.role) {
    filters.push(`role = $${idx++}`);
    values.push(req.query.role);
  }

  if (req.query.status) {
    filters.push(`status = $${idx++}`);
    values.push(req.query.status);
  }

  if (req.query.search) {
    filters.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx})`);
    values.push(`%${req.query.search}%`);
    idx += 1;
  }

  if (req.query.vehicleType) {
    filters.push(`$${idx} = ANY(COALESCE(vehicle_types_supported, '{}'::text[]))`);
    values.push(req.query.vehicleType);
    idx += 1;
  }

  if (req.query.suburb) {
    filters.push(`suburb ILIKE $${idx}`);
    values.push(`%${req.query.suburb}%`);
    idx += 1;
  }

  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT id, full_name, email, phone, role, status, date_of_birth, address, suburb, postcode, license_type, transmission_preference, logbook_hours, progress_percent, learning_status, license_number, service_areas, bio, availability, preferred_vehicle_type, pickup_address, pickup_suburb, pickup_latitude, pickup_longitude, emergency_contact_name, emergency_contact_phone, preferred_lesson_times, special_requirements, documentation_status, vehicle_types_supported, base_address, base_latitude, base_longitude, service_radius_km, max_travel_distance_km, created_at, updated_at
     FROM users
     ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset]
  );

  res.json({
    page,
    limit,
    users: result.rows.map(mapUser),
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT
       u.id, u.full_name, u.email, u.phone, u.role, u.status, u.date_of_birth, u.address, u.suburb, u.postcode,
       u.license_type, u.transmission_preference, u.logbook_hours, u.progress_percent, u.learning_status, u.license_number,
       u.service_areas, u.bio, u.availability, u.preferred_vehicle_type, u.pickup_address, u.pickup_suburb, u.pickup_latitude,
       u.pickup_longitude, u.emergency_contact_name, u.emergency_contact_phone, u.preferred_lesson_times, u.special_requirements,
       u.documentation_status, u.vehicle_types_supported, u.base_address, u.base_latitude, u.base_longitude,
       u.service_radius_km, u.max_travel_distance_km, u.created_at, u.updated_at,
       ip.id AS instructor_profile_id, ip.user_id, ip.languages_spoken, ip.profile_photo_url, ip.accreditation_number,
       ip.license_expiry, ip.has_wwcc, ip.has_police_clearance, ip.services_offered, ip.days_available, ip.times_available,
       ip.pickup_locations, ip.vehicle_make_model, ip.vehicle_transmission, ip.has_dual_control, ip.vehicle_photo_url,
       ip.price_1hr, ip.price_2hr, ip.price_test_package, ip.special_packages, ip.bank_details, ip.abn,
       ip.years_experience, ip.students_taught, ip.social_links, ip.testimonials_text, ip.agreed_commission,
       ip.agreed_terms, ip.agreed_cancellation, ip.created_at AS instructor_created_at, ip.updated_at AS instructor_updated_at
     FROM users u
     LEFT JOIN instructor_profiles ip ON ip.user_id = u.id
     WHERE u.id = $1`,
    [req.params.id]
  );

  if (result.rowCount === 0) {
    throw new AppError('User not found', 404);
  }

  await logAudit({
    actor: req.user,
    action: 'user.viewed',
    entityType: 'user',
    entityId: result.rows[0].id,
    targetUserId: result.rows[0].id,
    targetUserRole: result.rows[0].role,
    summary: `${req.user.role} viewed ${result.rows[0].role} ${result.rows[0].full_name}`,
    metadata: {
      viewedRole: result.rows[0].role,
      viewedEmail: result.rows[0].email,
    },
  });

  res.json({ user: mapUser(result.rows[0]) });
});

export const getMe = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, full_name, email, phone, role, status, date_of_birth, address, suburb, postcode, license_type, transmission_preference, logbook_hours, progress_percent, learning_status, license_number, service_areas, bio, availability, preferred_vehicle_type, pickup_address, pickup_suburb, pickup_latitude, pickup_longitude, emergency_contact_name, emergency_contact_phone, preferred_lesson_times, special_requirements, documentation_status, vehicle_types_supported, base_address, base_latitude, base_longitude, service_radius_km, max_travel_distance_km, created_at, updated_at FROM users WHERE id = $1',
    [req.user.id]
  );

  if (result.rowCount === 0) {
    throw new AppError('User not found', 404);
  }

  res.json({ user: mapUser(result.rows[0]) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid profile payload', 400);
  }
  const selfEditableData = { ...parsed.data };
  delete selfEditableData.role;
  delete selfEditableData.status;
  const { fields, values } = buildUpdateFragments(selfEditableData);

  if (fields.length === 0) {
    throw new AppError('No changes submitted', 400);
  }

  values.push(req.user.id);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length}
     RETURNING id, full_name, email, phone, role, status, date_of_birth, address, suburb, postcode, license_type, transmission_preference, logbook_hours, progress_percent, learning_status, license_number, service_areas, bio, availability, preferred_vehicle_type, pickup_address, pickup_suburb, pickup_latitude, pickup_longitude, emergency_contact_name, emergency_contact_phone, preferred_lesson_times, special_requirements, documentation_status, vehicle_types_supported, base_address, base_latitude, base_longitude, service_radius_km, max_travel_distance_km, created_at, updated_at`,
    values
  );

  res.json({ user: mapUser(result.rows[0]) });
});

export const updateUserById = asyncHandler(async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid profile payload', 400);
  }
  const updateData = { ...parsed.data };
  delete updateData.role;
  const { fields, values } = buildUpdateFragments(updateData);

  if (!fields.length) {
    throw new AppError('No changes submitted', 400);
  }

  values.push(req.params.id);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length}
     RETURNING id, full_name, email, phone, role, status, date_of_birth, address, suburb, postcode, license_type, transmission_preference, logbook_hours, progress_percent, learning_status, license_number, service_areas, bio, availability, preferred_vehicle_type, pickup_address, pickup_suburb, pickup_latitude, pickup_longitude, emergency_contact_name, emergency_contact_phone, preferred_lesson_times, special_requirements, documentation_status, vehicle_types_supported, base_address, base_latitude, base_longitude, service_radius_km, max_travel_distance_km, created_at, updated_at`,
    values
  );

  if (result.rowCount === 0) {
    throw new AppError('User not found', 404);
  }

  res.json({ user: mapUser(result.rows[0]) });
});

export const approveInstructor = asyncHandler(async (req, res) => {
  const result = await query(
    `UPDATE users
     SET status = 'active', updated_at = NOW()
     WHERE id = $1 AND role = 'instructor'
     RETURNING id, full_name, email, phone, role, status, date_of_birth, address, suburb, postcode, license_type, transmission_preference, logbook_hours, progress_percent, learning_status, license_number, service_areas, bio, availability, preferred_vehicle_type, pickup_address, pickup_suburb, pickup_latitude, pickup_longitude, emergency_contact_name, emergency_contact_phone, preferred_lesson_times, special_requirements, documentation_status, vehicle_types_supported, base_address, base_latitude, base_longitude, service_radius_km, max_travel_distance_km, created_at, updated_at`,
    [req.params.id]
  );

  if (result.rowCount === 0) {
    throw new AppError('Pending instructor not found', 404);
  }

  await logAudit({
    actor: req.user,
    action: 'instructor.approved',
    entityType: 'user',
    entityId: result.rows[0].id,
    targetUserId: result.rows[0].id,
    targetUserRole: 'instructor',
    summary: `Admin approved instructor ${result.rows[0].full_name}`,
    metadata: { email: result.rows[0].email },
  });

  res.json({ user: mapUser(result.rows[0]) });
});

export const rejectInstructor = asyncHandler(async (req, res) => {
  const result = await query(
    `DELETE FROM users
     WHERE id = $1 AND role = 'instructor'
     RETURNING id, full_name, email, phone, role, status, date_of_birth, address, suburb, postcode, license_type, transmission_preference, logbook_hours, progress_percent, learning_status, license_number, service_areas, bio, availability, preferred_vehicle_type, pickup_address, pickup_suburb, pickup_latitude, pickup_longitude, emergency_contact_name, emergency_contact_phone, preferred_lesson_times, special_requirements, documentation_status, vehicle_types_supported, base_address, base_latitude, base_longitude, service_radius_km, max_travel_distance_km, created_at, updated_at`,
    [req.params.id]
  );

  if (result.rowCount === 0) {
    throw new AppError('Instructor not found', 404);
  }

  await logAudit({
    actor: req.user,
    action: 'instructor.rejected',
    entityType: 'user',
    entityId: result.rows[0].id,
    targetUserId: result.rows[0].id,
    targetUserRole: 'instructor',
    summary: `Admin rejected and removed instructor application ${result.rows[0].full_name}`,
    metadata: { email: result.rows[0].email },
  });

  res.json({ user: mapUser({ ...result.rows[0], status: 'rejected' }) });
});
