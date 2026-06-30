import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env.js';
const globalForPrisma = globalThis;

const adapter = new PrismaPg({
  connectionString: env.databaseUrl,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

const rowsResult = (rows) => ({
  rows,
  rowCount: Array.isArray(rows) ? rows.length : 0,
});

const toPgArrayLiteral = (values) =>
  `{${values
    .map((value) => {
      const text = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `"${text}"`;
    })
    .join(',')}}`;

const normalizeParam = (value) => (Array.isArray(value) ? toPgArrayLiteral(value) : value);

export async function query(text, params = []) {
  const rows = await prisma.$queryRawUnsafe(text, ...params.map(normalizeParam));
  return rowsResult(Array.isArray(rows) ? rows : []);
}

export async function execute(text, params = []) {
  return prisma.$executeRawUnsafe(text, ...params.map(normalizeParam));
}

export async function withTransaction(fn) {
  return prisma.$transaction(async (tx) => {
    const transactional = {
      query: async (text, params = []) => {
        const rows = await tx.$queryRawUnsafe(text, ...params.map(normalizeParam));
        return rowsResult(Array.isArray(rows) ? rows : []);
      },
      execute: async (text, params = []) => tx.$executeRawUnsafe(text, ...params.map(normalizeParam)),
    };

    return fn(transactional);
  });
}

const createTables = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('learner', 'instructor', 'admin')),
    status TEXT NOT NULL DEFAULT 'active',
    date_of_birth DATE,
    address TEXT,
    suburb TEXT,
    postcode TEXT,
    license_type TEXT,
    transmission_preference TEXT,
    preferred_vehicle_type TEXT,
    pickup_address TEXT,
    pickup_suburb TEXT,
    pickup_latitude NUMERIC(10,7),
    pickup_longitude NUMERIC(10,7),
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    preferred_lesson_times JSONB DEFAULT '[]'::jsonb,
    special_requirements TEXT,
    logbook_hours INTEGER NOT NULL DEFAULT 0,
    progress_percent INTEGER NOT NULL DEFAULT 0,
    learning_status TEXT NOT NULL DEFAULT 'not_started',
    license_number TEXT,
    service_areas TEXT[] DEFAULT '{}',
    bio TEXT,
    availability JSONB DEFAULT '[]'::jsonb,
    documentation_status TEXT DEFAULT 'pending',
    vehicle_types_supported TEXT[] DEFAULT '{}'::text[],
    base_address TEXT,
    base_latitude NUMERIC(10,7),
    base_longitude NUMERIC(10,7),
    service_radius_km INTEGER DEFAULT 25,
    max_travel_distance_km INTEGER DEFAULT 25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS instructor_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    languages_spoken TEXT,
    profile_photo_url TEXT,
    accreditation_number TEXT,
    license_expiry DATE,
    has_wwcc BOOLEAN NOT NULL DEFAULT FALSE,
    has_police_clearance BOOLEAN NOT NULL DEFAULT FALSE,
    services_offered JSONB,
    days_available TEXT,
    times_available TEXT,
    pickup_locations TEXT,
    vehicle_make_model TEXT,
    vehicle_transmission TEXT,
    has_dual_control BOOLEAN NOT NULL DEFAULT FALSE,
    vehicle_photo_url TEXT,
    price_1hr NUMERIC(10,2),
    price_2hr NUMERIC(10,2),
    price_test_package NUMERIC(10,2),
    special_packages TEXT,
    bank_details TEXT,
    abn TEXT,
    years_experience INTEGER,
    students_taught INTEGER,
    social_links TEXT,
    testimonials_text TEXT,
    agreed_commission BOOLEAN NOT NULL DEFAULT FALSE,
    agreed_terms BOOLEAN NOT NULL DEFAULT FALSE,
    agreed_cancellation BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS lesson_packages (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 90,
    category TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    included_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    booking_number TEXT NOT NULL UNIQUE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    booking_type TEXT NOT NULL,
    package_id TEXT REFERENCES lesson_packages(id) ON DELETE SET NULL,
    lesson_date DATE NOT NULL,
    lesson_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    pickup_suburb TEXT,
    pickup_address TEXT,
    instructor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS contact_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS lesson_sessions (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    instructor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    lesson_type TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS student_progress (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    percent_complete INTEGER NOT NULL DEFAULT 0,
    last_updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS instructor_notes (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instructor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS content_pages (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    seo_title TEXT,
    seo_description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS vehicle_types (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    requires_document_verification BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS training_requests (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instructor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL,
    package_id TEXT REFERENCES lesson_packages(id) ON DELETE SET NULL,
    preferred_date DATE,
    preferred_time TEXT,
    pickup_address TEXT,
    pickup_suburb TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    response_message TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS learner_documents (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    verified_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS student_assignments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instructor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    source_training_request_id TEXT REFERENCES training_requests(id) ON DELETE SET NULL
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS transfer_requests (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_instructor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_instructor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_assignment_id TEXT REFERENCES student_assignments(id) ON DELETE SET NULL,
    new_assignment_id TEXT REFERENCES student_assignments(id) ON DELETE SET NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'requested',
    response_message TEXT,
    progress_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    hours_transferred INTEGER NOT NULL DEFAULT 0,
    package_balance_transferred NUMERIC(10,2) NOT NULL DEFAULT 0,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    actor_role TEXT,
    actor_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    target_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    target_user_role TEXT,
    summary TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
];

const packagesSeed = [
  {
    code: 'single-1hr',
    name: '1 Hour Lesson',
    description: 'Perfect for a quick refresher or assessment.',
    price: 135,
    durationMinutes: 60,
    category: 'single',
    includedItems: ['Door-to-door pickup & drop-off', 'Modern dual-control vehicle', '1-on-1 instruction'],
  },
  {
    code: 'single-1_5hr',
    name: '1.5 Hour Lesson',
    description: 'The sweet spot for learning new skills.',
    price: 160,
    durationMinutes: 90,
    category: 'single',
    includedItems: ['Door-to-door pickup & drop-off', 'Extended practice time', 'Logbook updates included'],
  },
  {
    code: 'single-2hr',
    name: '2 Hour Lesson',
    description: 'Intensive session for maximum progress.',
    price: 220,
    durationMinutes: 120,
    category: 'single',
    includedItems: ['Deep dive into complex traffic', 'Mock driving test preparation', 'Comprehensive feedback'],
  },
  {
    code: 'bulk-10',
    name: '10 Lesson Package',
    description: 'Ideal for building a solid foundation of driving skills.',
    price: 1050,
    durationMinutes: 90,
    category: 'bulk',
    includedItems: ['10 lessons', 'Priority scheduling'],
  },
  {
    code: 'bulk-20',
    name: '20 Lesson Package',
    description: 'Comprehensive training covering all test requirements.',
    price: 2000,
    durationMinutes: 90,
    category: 'bulk',
    includedItems: ['20 lessons', 'Priority scheduling'],
  },
  {
    code: 'test-day',
    name: 'Test Day Package',
    description: 'Perfect if you are already test-ready.',
    price: 750,
    durationMinutes: 120,
    category: 'test',
    includedItems: ['2 hour lesson before test', 'Test vehicle hire included', 'Driving test booking', 'Instructor support on the day'],
  },
  {
    code: 'complete-learner',
    name: 'Complete Learner',
    description: 'From beginner to fully licensed.',
    price: 3500,
    durationMinutes: 90,
    category: 'learner',
    includedItems: ['Up to 25 driving lessons', 'Includes 2 driving tests', 'Vehicle for both tests', 'Comprehensive test prep', 'Priority booking slots'],
  },
  {
    code: 'learner-plus-1-test',
    name: 'Learner + 1 Test',
    description: 'Great value for confident learners.',
    price: 3000,
    durationMinutes: 90,
    category: 'learner',
    includedItems: ['Up to 26 driving classes', 'Includes 1 driving test', 'Vehicle for the test', 'Structured learning plan'],
  },
  {
    code: 'overseas-conversion',
    name: 'International Conversion Package',
    description: 'Designed specifically for experienced overseas drivers.',
    price: 825,
    durationMinutes: 180,
    category: 'overseas',
    includedItems: ['3 hours of dedicated driving lessons', 'SA road rule focus', 'Mock test preparation', 'Test vehicle hire included', 'Driving test support'],
  },
];

const contentSeed = [
  { slug: 'pricing', title: 'Driving Lessons & Pricing' },
  { slug: 'packages', title: 'Learner Driver Packages' },
  { slug: 'overseas', title: 'Overseas Licence Transfer' },
  { slug: 'hub', title: 'Licensing Information Hub' },
  { slug: 'resources', title: 'Online Resources' },
  { slug: 'contact', title: 'Contact Us' },
  { slug: 'faq', title: 'Frequently Asked Questions' },
  { slug: 'testimonials', title: 'Student Testimonials' },
  { slug: 'areas', title: 'Service Areas' },
  { slug: 'countries', title: 'Recognised Countries' },
  { slug: 'about', title: 'About SANOS Driving School' },
  { slug: 'quote', title: 'Get a Quote' },
];

const vehicleTypeSeed = [
  { code: 'standard-car', name: 'Standard Car', description: 'General learner car training', requiresDocumentVerification: false },
  { code: 'manual-car', name: 'Manual Car', description: 'Manual transmission lessons', requiresDocumentVerification: false },
  { code: 'automatic-car', name: 'Automatic Car', description: 'Automatic transmission lessons', requiresDocumentVerification: false },
  { code: 'test-vehicle', name: 'Test Vehicle', description: 'Vehicle used for test-day support', requiresDocumentVerification: true },
  { code: 'overseas-conversion', name: 'Overseas Conversion', description: 'Overseas licence conversion training', requiresDocumentVerification: true },
];

const instructorSeed = {
  id: 'seed-instructor-1',
  fullName: 'Test Instructor',
  email: 'test-instructor@sanosdriving.com.au',
  phone: '0412 000 111',
  password: 'Test1234',
  suburb: 'Adelaide',
  bio: 'Experienced driving instructor for learner lessons and test preparation.',
  serviceAreas: ['Adelaide', 'Mawson Lakes', 'Glenelg'],
  vehicleTypesSupported: ['Automatic Car', 'Manual Car'],
  baseAddress: 'Adelaide SA',
  baseLatitude: -34.9285,
  baseLongitude: 138.6007,
  serviceRadiusKm: 25,
  maxTravelDistanceKm: 25,
  languagesSpoken: 'English',
  daysAvailable: 'Mon-Fri',
  timesAvailable: '8am-5pm',
  vehicleMakeModel: 'Toyota Corolla',
  vehicleTransmission: 'Automatic',
  hasDualControl: true,
  yearsExperience: 8,
  studentsTaught: 250,
};

export async function initializeDatabase() {
  for (const statement of createTables) {
    await execute(statement);
  }

  const alterStatements = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS transmission_preference TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_vehicle_type TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pickup_address TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pickup_suburb TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pickup_latitude NUMERIC(10,7)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pickup_longitude NUMERIC(10,7)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_lesson_times JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS special_requirements TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_status TEXT NOT NULL DEFAULT 'not_started'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS documentation_status TEXT DEFAULT 'pending'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_types_supported TEXT[] DEFAULT '{}'::text[]`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS base_address TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS base_latitude NUMERIC(10,7)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS base_longitude NUMERIC(10,7)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS service_radius_km INTEGER DEFAULT 25`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS max_travel_distance_km INTEGER DEFAULT 25`,
    `ALTER TABLE transfer_requests ADD COLUMN IF NOT EXISTS response_message TEXT`,
    `ALTER TABLE transfer_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_type TEXT`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_category TEXT`,
    `ALTER TABLE lesson_sessions ADD COLUMN IF NOT EXISTS vehicle_type TEXT`,
    `ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS vehicle_type TEXT`,
    `ALTER TABLE instructor_notes ADD COLUMN IF NOT EXISTS vehicle_type TEXT`,
  ];

  for (const statement of alterStatements) {
    await execute(statement);
  }

  const indexStatements = [
    `CREATE INDEX IF NOT EXISTS audit_logs_actor_role_created_at_idx ON audit_logs(actor_role, created_at)`,
    `CREATE INDEX IF NOT EXISTS audit_logs_target_user_role_created_at_idx ON audit_logs(target_user_role, created_at)`,
    `CREATE INDEX IF NOT EXISTS audit_logs_action_created_at_idx ON audit_logs(action, created_at)`,
  ];

  for (const statement of indexStatements) {
    await execute(statement);
  }

  await execute(`DELETE FROM users WHERE role = 'instructor' AND status = 'rejected'`);

  const existingPackageCount = await query('SELECT COUNT(*)::int AS count FROM lesson_packages');
  if (existingPackageCount.rows[0].count === 0) {
    for (const pkg of packagesSeed) {
      await execute(
        `INSERT INTO lesson_packages (id, code, name, description, price, duration_minutes, category, is_active, included_items)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8::jsonb)`,
        [
          crypto.randomUUID(),
          pkg.code,
          pkg.name,
          pkg.description,
          pkg.price,
          pkg.durationMinutes,
          pkg.category,
          JSON.stringify(pkg.includedItems),
        ]
      );
    }
  }

  const existingContentCount = await query('SELECT COUNT(*)::int AS count FROM content_pages');
  if (existingContentCount.rows[0].count === 0) {
    for (const page of contentSeed) {
      await execute(
        `INSERT INTO content_pages (id, slug, title, content, seo_title, seo_description, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
        [
          crypto.randomUUID(),
          page.slug,
          page.title,
          '',
          page.title,
          `${page.title} for SANOS Driving School`,
        ]
      );
    }
  }

  const existingVehicleTypeCount = await query('SELECT COUNT(*)::int AS count FROM vehicle_types');
  if (existingVehicleTypeCount.rows[0].count === 0) {
    for (const vehicleType of vehicleTypeSeed) {
      await execute(
        `INSERT INTO vehicle_types (id, code, name, description, requires_document_verification, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [crypto.randomUUID(), vehicleType.code, vehicleType.name, vehicleType.description, vehicleType.requiresDocumentVerification]
      );
    }
  }

  const existingInstructor = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [instructorSeed.email]);
  if (existingInstructor.rowCount === 0) {
    const passwordHash = await bcrypt.hash(instructorSeed.password, 12);
    await execute(
      `INSERT INTO users (
        id, full_name, email, phone, password_hash, role, status, suburb, bio,
        service_areas, vehicle_types_supported, preferred_lesson_times, availability, base_address, base_latitude, base_longitude,
        service_radius_km, max_travel_distance_km, documentation_status, learning_status
      )
       VALUES (
        $1, $2, $3, $4, $5, 'instructor', 'pending', $6, $7,
        $8::text[], $9::text[], $10::jsonb, $11::jsonb, $12, $13, $14,
        $15, $16, 'pending', 'not_started'
      )
      ON CONFLICT (id) DO NOTHING`,
      [
        instructorSeed.id,
        instructorSeed.fullName,
        instructorSeed.email,
        instructorSeed.phone,
        passwordHash,
        instructorSeed.suburb,
        instructorSeed.bio,
        instructorSeed.serviceAreas,
        instructorSeed.vehicleTypesSupported,
        JSON.stringify([]),
        JSON.stringify([]),
        instructorSeed.baseAddress,
        instructorSeed.baseLatitude,
        instructorSeed.baseLongitude,
        instructorSeed.serviceRadiusKm,
        instructorSeed.maxTravelDistanceKm,
      ]
    );

    await execute(
      `INSERT INTO instructor_profiles (
        id, user_id, languages_spoken, days_available, times_available,
        vehicle_make_model, vehicle_transmission, has_dual_control,
        years_experience, students_taught, agreed_commission, agreed_terms, agreed_cancellation
      )
       VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, TRUE, TRUE, TRUE
      )
      ON CONFLICT (user_id) DO NOTHING`,
      [
        crypto.randomUUID(),
        instructorSeed.id,
        instructorSeed.languagesSpoken,
        instructorSeed.daysAvailable,
        instructorSeed.timesAvailable,
        instructorSeed.vehicleMakeModel,
        instructorSeed.vehicleTransmission,
        instructorSeed.hasDualControl,
        instructorSeed.yearsExperience,
        instructorSeed.studentsTaught,
      ]
    );
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
