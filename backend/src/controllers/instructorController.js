import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';

/**
 * GET /api/instructors
 * Public — returns all active instructors with key booking-relevant fields.
 */
export const listActiveInstructors = asyncHandler(async (_req, res) => {
  const result = await query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       u.phone,
       u.suburb,
       u.bio,
       u.service_areas,
       u.vehicle_types_supported,
       u.base_address,
       u.service_radius_km,
       ip.profile_photo_url,
       ip.languages_spoken,
       ip.days_available,
       ip.times_available,
       ip.vehicle_make_model,
       ip.vehicle_transmission,
       ip.has_dual_control,
       ip.years_experience,
       ip.students_taught,
       ip.price_1hr,
       ip.price_2hr
     FROM users u
     LEFT JOIN instructor_profiles ip ON ip.user_id = u.id
     WHERE u.role = 'instructor'
       AND u.status = 'active'
     ORDER BY u.full_name ASC`,
    []
  );

  const instructors = result.rows.map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    suburb: row.suburb,
    bio: row.bio,
    serviceAreas: row.service_areas || [],
    vehicleTypesSupported: row.vehicle_types_supported || [],
    baseAddress: row.base_address,
    serviceRadiusKm: row.service_radius_km,
    profilePhotoUrl: row.profile_photo_url,
    languagesSpoken: row.languages_spoken,
    daysAvailable: row.days_available,
    timesAvailable: row.times_available,
    vehicleMakeModel: row.vehicle_make_model,
    vehicleTransmission: row.vehicle_transmission,
    hasDualControl: row.has_dual_control,
    yearsExperience: row.years_experience,
    studentsTaught: row.students_taught,
    price1Hr: row.price_1hr,
    price2Hr: row.price_2hr,
  }));

  res.json({ instructors });
});

