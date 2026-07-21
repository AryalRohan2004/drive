import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { execute, query, disconnectDatabase } from './src/config/db.js';

async function main() {
  console.log('Starting admin seed...');

  const adminEmail = 'admin@sanosdriving.com.au';
  const existingAdmin = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);

  if (existingAdmin.rowCount === 0) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    const userId = crypto.randomUUID();
    await execute(
      `INSERT INTO users (
        id, full_name, email, password_hash, role, status, availability, preferred_lesson_times
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)`,
      [
        userId,
        'System Admin',
        adminEmail,
        passwordHash,
        'admin',
        'active',
        JSON.stringify({}),
        JSON.stringify({})
      ]
    );
    console.log('✅ Created admin user: admin@sanosdriving.com.au / admin123');
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  // ─── Seed Instructor ───────────────────────────────────────────────────────
  const instructorEmail = 'instructor@sanosdriving.com.au';
  const existingInstructor = await query('SELECT id FROM users WHERE email = $1', [instructorEmail]);

  if (existingInstructor.rowCount === 0) {
    const passwordHash = await bcrypt.hash('instructor123', 12);
    const instructorId = crypto.randomUUID();
    await execute(
      `INSERT INTO users (
        id, full_name, email, phone, password_hash, role, status,
        service_areas, vehicle_types_supported, bio,
        base_address, base_latitude, base_longitude,
        service_radius_km, max_travel_distance_km,
        availability, preferred_lesson_times
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb)`,
      [
        instructorId,
        'James Mitchell',
        instructorEmail,
        '0412345678',
        passwordHash,
        'instructor',
        'active',
        ['Sydney CBD', 'Parramatta', 'Blacktown'],
        ['car', 'suv'],
        'Experienced driving instructor with 10+ years helping learners gain confidence on the road.',
        '123 George St, Sydney NSW 2000',
        -33.8688,
        151.2093,
        30,
        30,
        JSON.stringify({
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: { start: '09:00', end: '14:00' },
        }),
        JSON.stringify({})
      ]
    );

    // Create instructor profile
    await execute(
      `INSERT INTO instructor_profiles (
        id, user_id, languages_spoken, accreditation_number,
        has_wwcc, has_police_clearance, services_offered,
        days_available, times_available, pickup_locations,
        vehicle_make_model, vehicle_transmission, has_dual_control,
        price_1hr, price_2hr, price_test_package,
        years_experience, students_taught,
        agreed_commission, agreed_terms, agreed_cancellation
      ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [
        crypto.randomUUID(),
        instructorId,
        'English, Hindi',
        'ACC-2024-001',
        true,
        true,
        JSON.stringify(['Manual Lessons', 'Automatic Lessons', 'Test Preparation', 'Defensive Driving']),
        'Monday-Saturday',
        '8:00 AM - 5:00 PM',
        'Sydney CBD, Parramatta, Blacktown',
        'Toyota Corolla 2023',
        'automatic',
        true,
        65.00,
        120.00,
        180.00,
        10,
        500,
        true,
        true,
        true
      ]
    );

    console.log('✅ Created instructor: instructor@sanosdriving.com.au / instructor123');
  } else {
    console.log('ℹ️ Instructor already exists.');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDatabase();
  });
