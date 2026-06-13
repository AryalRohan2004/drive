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
