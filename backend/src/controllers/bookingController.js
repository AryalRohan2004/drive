import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query, withTransaction } from '../config/db.js';
import { sendEmail } from '../services/emailService.js';
import { logAudit } from '../utils/auditLogger.js';

const bookingSchema = z.object({
  studentId: z.string().optional().nullable(),
  bookingType: z.enum(['learner', 'overseas', 'test']),
  vehicleType: z.string().optional().nullable(),
  vehicleCategory: z.string().optional().nullable(),
  packageCode: z.string().min(2).optional(),
  packageId: z.string().min(2).optional(),
  lessonDate: z.string().date(),
  lessonTime: z.string().min(1),
  pickupSuburb: z.string().optional().nullable(),
  pickupAddress: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  guestName: z.string().optional().nullable(),
  guestEmail: z.string().email().optional().nullable(),
  guestPhone: z.string().optional().nullable(),
  instructorId: z.string().optional().nullable(),
});

const mapBooking = (row) => ({
  id: row.id,
  bookingNumber: row.booking_number,
  userId: row.user_id,
  guestName: row.guest_name,
  guestEmail: row.guest_email,
  guestPhone: row.guest_phone,
  bookingType: row.booking_type,
  vehicleType: row.vehicle_type,
  vehicleCategory: row.vehicle_category,
  packageId: row.package_id,
  packageCode: row.package_code,
  packageName: row.package_name,
  lessonDate: row.lesson_date,
  lessonTime: row.lesson_time,
  status: row.status,
  paymentStatus: row.payment_status,
  price: Number(row.price),
  notes: row.notes,
  pickupSuburb: row.pickup_suburb,
  pickupAddress: row.pickup_address,
  instructorId: row.instructor_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const runInTransaction = async (fn) => withTransaction((client) => fn(client));

const parseTimeToMinutes = (value) => {
  if (!value) return null;
  const text = String(value).trim();
  const amPmMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hour = Number(amPmMatch[1]);
    const minute = Number(amPmMatch[2]);
    const period = amPmMatch[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
  }

  const twentyFourHourMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHourMatch) {
    return Number(twentyFourHourMatch[1]) * 60 + Number(twentyFourHourMatch[2]);
  }

  return null;
};

const rangesOverlap = (startA, endA, startB, endB) => startA < endB && startB < endA;

const addMinutesToTime = (timeValue, minutesToAdd) => {
  if (!timeValue) return timeValue;

  const text = String(timeValue).trim();
  const amPmMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hour = Number(amPmMatch[1]);
    const minute = Number(amPmMatch[2]);
    const period = amPmMatch[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const totalMinutes = hour * 60 + minute + Number(minutesToAdd || 0);
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const nextHour = Math.floor(normalized / 60);
    const nextMinute = normalized % 60;
    const suffix = nextHour >= 12 ? 'PM' : 'AM';
    const displayHour = nextHour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')} ${suffix}`;
  }

  const twentyFourHourMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);
    const totalMinutes = hour * 60 + minute + Number(minutesToAdd || 0);
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const nextHour = Math.floor(normalized / 60);
    const nextMinute = normalized % 60;
    return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}:00`;
  }

  return timeValue;
};

const assertLearnerRequirements = async (studentId, selectedVehicleType) => {
  if (!selectedVehicleType) return;

  const vehicleType = await query(
    `SELECT code, name, requires_document_verification
     FROM vehicle_types
     WHERE is_active = TRUE AND (code = $1 OR LOWER(name) = LOWER($1))
     LIMIT 1`,
    [selectedVehicleType]
  );

  const matched = vehicleType.rows[0];
  if (!matched?.requires_document_verification) return;

  const verified = await query(
    `SELECT id FROM learner_documents
     WHERE student_id = $1
       AND status = 'verified'
       AND (document_type = $2 OR document_type = $3)
     LIMIT 1`,
    [studentId, matched.code, matched.name]
  );

  if (verified.rowCount === 0) {
    throw new AppError(`Verified ${matched.name} document is required before booking this lesson.`, 403);
  }
};

const assertCanAccessBooking = async (booking, user, action = 'access') => {
  if (user.role === 'admin') return;

  if (user.role === 'instructor') {
    if (user.status !== 'active') {
      throw new AppError(`Only an active instructor can ${action} this booking`, 403);
    }

    if (booking.instructor_id !== user.id) {
      throw new AppError(`You do not have permission to ${action} this booking`, 403);
    }

    return;
  }

  if (booking.user_id === user.id) return;

  throw new AppError(`You do not have access to ${action} this booking`, 403);
};

const assertNoInstructorConflict = async ({ instructorId, lessonDate, lessonTime, durationMinutes, excludeBookingId = null }) => {
  const requestedStart = parseTimeToMinutes(lessonTime);
  if (requestedStart === null) {
    throw new AppError('Lesson time is invalid', 400);
  }
  const requestedEnd = requestedStart + Number(durationMinutes || 60);

  const existing = await query(
    `SELECT b.id, b.lesson_time, COALESCE(p.duration_minutes, 60) AS duration_minutes
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     WHERE b.lesson_date = $1::date
       AND b.instructor_id = $2
       AND b.status IN ('pending', 'confirmed')
       AND ($3::text IS NULL OR b.id <> $3)
     UNION ALL
     SELECT ls.id, ls.start_time AS lesson_time, 60 AS duration_minutes
     FROM lesson_sessions ls
     WHERE ls.session_date = $1::date
       AND ls.instructor_id = $2
       AND ls.status IN ('scheduled', 'in_progress')
       AND ($3::text IS NULL OR ls.booking_id IS DISTINCT FROM $3)`,
    [lessonDate, instructorId, excludeBookingId]
  );

  const conflict = existing.rows.find((booking) => {
    const bookedStart = parseTimeToMinutes(booking.lesson_time);
    if (bookedStart === null) return false;
    const bookedEnd = bookedStart + Number(booking.duration_minutes || 60);
    return rangesOverlap(requestedStart, requestedEnd, bookedStart, bookedEnd);
  });

  if (conflict) {
    throw new AppError('That time slot is already booked', 409);
  }
};

const ensureLearningStarted = async (client, booking) => {
  if (!booking.user_id || !booking.instructor_id) return null;

  const active = await client.query(
    `SELECT * FROM student_assignments
     WHERE student_id = $1 AND status = 'active'
     ORDER BY started_at DESC
     LIMIT 1`,
    [booking.user_id]
  );

  if (active.rowCount > 0 && active.rows[0].instructor_id === booking.instructor_id) {
    await client.query(
      `UPDATE users SET learning_status = 'active', updated_at = NOW() WHERE id = $1`,
      [booking.user_id]
    );
    return active.rows[0];
  }

  if (active.rowCount > 0) {
    await client.query(
      `UPDATE student_assignments SET status = 'transferred', ended_at = NOW() WHERE id = $1`,
      [active.rows[0].id]
    );
  }

  const created = await client.query(
    `INSERT INTO student_assignments (id, student_id, instructor_id, vehicle_type, status, started_at)
     VALUES ($1, $2, $3, $4, 'active', NOW())
     RETURNING *`,
    [crypto.randomUUID(), booking.user_id, booking.instructor_id, booking.vehicle_type || 'standard-car']
  );

  await client.query(
    `UPDATE users SET learning_status = 'active', updated_at = NOW() WHERE id = $1`,
    [booking.user_id]
  );

  return created.rows[0];
};

const ensureScheduledSession = async (client, booking) => {
  if (!booking.user_id || !booking.instructor_id) return null;

  const existing = await client.query('SELECT * FROM lesson_sessions WHERE booking_id = $1 LIMIT 1', [booking.id]);
  if (existing.rowCount > 0) return existing.rows[0];

  const created = await client.query(
    `INSERT INTO lesson_sessions (
      id, booking_id, student_id, instructor_id, session_date, start_time, end_time,
      location, lesson_type, vehicle_type, status, notes
    )
     VALUES ($1,$2,$3,$4,$5::date,$6::time,$7::time,$8,$9,$10,'scheduled',$11)
     RETURNING *`,
    [
      crypto.randomUUID(),
      booking.id,
      booking.user_id,
      booking.instructor_id,
      booking.lesson_date,
      booking.lesson_time,
      addMinutesToTime(booking.lesson_time, Number(booking.duration_minutes || 60)),
      booking.pickup_address || booking.pickup_suburb || null,
      booking.booking_type,
      booking.vehicle_type || null,
      booking.notes || null,
    ]
  );

  return created.rows[0];
};

export const listBookings = asyncHandler(async (req, res) => {
  const filters = [];
  const values = [];
  let idx = 1;

  if (req.user.role === 'learner') {
    filters.push(`b.user_id = $${idx++}`);
    values.push(req.user.id);
  } else if (req.user.role === 'instructor') {
    filters.push(`b.instructor_id = $${idx++}`);
    values.push(req.user.id);
  } else if (req.query.studentId) {
    filters.push(`b.user_id = $${idx++}`);
    values.push(req.query.studentId);
  }

  if (req.query.status) {
    filters.push(`b.status = $${idx++}`);
    values.push(req.query.status);
  }

  if (req.query.bookingType) {
    filters.push(`b.booking_type = $${idx++}`);
    values.push(req.query.bookingType);
  }

  if (req.query.instructorId) {
    filters.push(`b.instructor_id = $${idx++}`);
    values.push(req.query.instructorId);
  }

  if (req.query.studentId) {
    filters.push(`b.user_id = $${idx++}`);
    values.push(req.query.studentId);
  }

  if (req.query.from) {
    filters.push(`b.lesson_date >= $${idx++}::date`);
    values.push(req.query.from);
  }

  if (req.query.to) {
    filters.push(`b.lesson_date <= $${idx++}::date`);
    values.push(req.query.to);
  }

  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 100)));
  const offset = (page - 1) * limit;

  const sql = `
    SELECT b.*, p.code AS package_code, p.name AS package_name
    FROM bookings b
    LEFT JOIN lesson_packages p ON p.id = b.package_id
    ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
    ORDER BY b.lesson_date DESC, b.lesson_time DESC, b.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const result = await query(sql, [...values, limit, offset]);
  res.json({ page, limit, bookings: result.rows.map(mapBooking) });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT b.*, p.code AS package_code, p.name AS package_name
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     WHERE b.id = $1`,
    [req.params.id]
  );

  if (result.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  const booking = result.rows[0];
  await assertCanAccessBooking(booking, req.user, 'view');

  res.json({ booking: mapBooking(booking) });
});

export const createBooking = asyncHandler(async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid booking payload', 400);
  }

  const data = parsed.data;
  const selectedVehicleType = data.vehicleType || data.vehicleCategory || null;
  const studentId = req.user.role === 'admin' ? data.studentId || req.user.id : req.user.id;
  let packageRow = null;

  if (data.packageId) {
    const byId = await query('SELECT * FROM lesson_packages WHERE id = $1 AND is_active = TRUE', [data.packageId]);
    if (byId.rowCount === 0) {
      throw new AppError('Package not found', 404);
    }
    packageRow = byId.rows[0];
  } else if (data.packageCode) {
    const byCode = await query('SELECT * FROM lesson_packages WHERE code = $1 AND is_active = TRUE', [data.packageCode]);
    if (byCode.rowCount === 0) {
      throw new AppError('Package not found', 404);
    }
    packageRow = byCode.rows[0];
  } else {
    throw new AppError('A package code or package ID is required', 400);
  }

  if (!data.instructorId) {
    throw new AppError('Instructor is required before creating a learner booking', 400);
  }

  const instructor = await query(
    `SELECT id FROM users WHERE id = $1 AND role = 'instructor' AND status = 'active'`,
    [data.instructorId]
  );
  if (instructor.rowCount === 0) {
    throw new AppError('Instructor not found or unavailable', 404);
  }

  const learner = await query(
    `SELECT id FROM users WHERE id = $1 AND role = 'learner' AND status = 'active'`,
    [studentId]
  );
  if (learner.rowCount === 0) {
    throw new AppError('Active learner account is required before creating a booking', 403);
  }

  await assertLearnerRequirements(studentId, selectedVehicleType);

  await assertNoInstructorConflict({
    instructorId: data.instructorId,
    lessonDate: data.lessonDate,
    lessonTime: data.lessonTime,
    durationMinutes: packageRow.duration_minutes,
  });

  const bookingNumber = `SANOS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
  const result = await query(
     `INSERT INTO bookings (
      id, booking_number, user_id, guest_name, guest_email, guest_phone,
      booking_type, package_id, lesson_date, lesson_time, status,
      payment_status, price, notes, pickup_suburb, pickup_address, instructor_id, vehicle_type, vehicle_category
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::date, $10::time, 'pending', 'unpaid', $11, $12, $13, $14, $15, $16, $17)
     RETURNING *`,
    [
      crypto.randomUUID(),
      bookingNumber,
      studentId,
      data.guestName || null,
      data.guestEmail || req.user.email || null,
      data.guestPhone || req.user.phone || null,
      data.bookingType,
      packageRow.id,
      data.lessonDate,
      data.lessonTime,
      packageRow.price,
      data.notes || null,
      data.pickupSuburb || null,
      data.pickupAddress || null,
      data.instructorId || null,
      selectedVehicleType,
      selectedVehicleType,
    ]
  );

  const booking = mapBooking({ ...result.rows[0], package_code: packageRow.code, package_name: packageRow.name });

  const notificationEmail = booking.guestEmail || req.user?.email;
  if (notificationEmail) {
    await sendEmail({
      to: notificationEmail,
      subject: 'Your SANOS booking is received',
      text: `Your booking ${booking.bookingNumber} has been received and is pending confirmation.`,
      html: `<p>Your booking <strong>${booking.bookingNumber}</strong> has been received and is pending confirmation.</p>`,
    });
  }

  await logAudit({
    actor: req.user,
    action: 'booking.created',
    entityType: 'booking',
    entityId: booking.id,
    targetUserId: booking.userId,
    targetUserRole: 'learner',
    summary: `${req.user.role} created booking ${booking.bookingNumber}`,
    metadata: {
      instructorId: booking.instructorId,
      lessonDate: booking.lessonDate,
      lessonTime: booking.lessonTime,
      packageId: booking.packageId,
      bookingType: booking.bookingType,
    },
  });

  res.status(201).json({ booking });
});

export const updateBooking = asyncHandler(async (req, res) => {
  const allowed = z.object({
    status: z.string().optional(),
    paymentStatus: z.string().optional(),
    lessonDate: z.string().date().optional(),
    lessonTime: z.string().optional(),
    notes: z.string().optional().nullable(),
    instructorId: z.string().optional().nullable(),
    vehicleType: z.string().optional().nullable(),
    vehicleCategory: z.string().optional().nullable(),
  }).safeParse(req.body);

  if (!allowed.success) {
    throw new AppError(allowed.error.issues[0]?.message || 'Invalid booking update payload', 400);
  }

  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(allowed.data)) {
    const columnMap = {
      status: 'status',
      paymentStatus: 'payment_status',
      lessonDate: 'lesson_date',
      lessonTime: 'lesson_time',
      notes: 'notes',
      instructorId: 'instructor_id',
      vehicleType: 'vehicle_type',
      vehicleCategory: 'vehicle_category',
    };
    fields.push(`${columnMap[key]} = $${idx++}`);
    values.push(value);
  }

  if (fields.length === 0) {
    throw new AppError('No changes submitted', 400);
  }

  const existing = await query(
    `SELECT b.*, COALESCE(p.duration_minutes, 60) AS duration_minutes
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     WHERE b.id = $1`,
    [req.params.id]
  );

  if (existing.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  const current = existing.rows[0];
  await assertCanAccessBooking(current, req.user, 'update');
  const nextInstructorId = allowed.data.instructorId ?? current.instructor_id;
  const nextLessonDate = allowed.data.lessonDate ?? current.lesson_date;
  const nextLessonTime = allowed.data.lessonTime ?? current.lesson_time;
  const nextStatus = allowed.data.status ?? current.status;

  if (nextInstructorId && nextLessonDate && nextLessonTime && ['pending', 'confirmed'].includes(nextStatus)) {
    await assertNoInstructorConflict({
      instructorId: nextInstructorId,
      lessonDate: nextLessonDate,
      lessonTime: nextLessonTime,
      durationMinutes: current.duration_minutes,
      excludeBookingId: req.params.id,
    });
  }

  values.push(req.params.id);

  const result = await query(
    `UPDATE bookings SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );

  if (result.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  await logAudit({
    actor: req.user,
    action: 'booking.updated',
    entityType: 'booking',
    entityId: result.rows[0].id,
    targetUserId: result.rows[0].user_id,
    targetUserRole: 'learner',
    summary: `${req.user.role} updated booking ${result.rows[0].booking_number}`,
    metadata: { changes: allowed.data },
  });

  res.json({ booking: result.rows[0] });
});

export const confirmBooking = asyncHandler(async (req, res) => {
  const existing = await query(
    `SELECT b.*, COALESCE(p.duration_minutes, 60) AS duration_minutes
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     WHERE b.id = $1`,
    [req.params.id]
  );

  if (existing.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  const bookingToConfirm = existing.rows[0];
  await assertCanAccessBooking(bookingToConfirm, req.user, 'confirm');
  if (bookingToConfirm.instructor_id) {
    await assertNoInstructorConflict({
      instructorId: bookingToConfirm.instructor_id,
      lessonDate: bookingToConfirm.lesson_date,
      lessonTime: bookingToConfirm.lesson_time,
      durationMinutes: bookingToConfirm.duration_minutes,
      excludeBookingId: req.params.id,
    });
  }

  const result = await runInTransaction(async (client) => {
    const updated = await client.query(
      `UPDATE bookings
       SET status = 'confirmed', payment_status = 'paid', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (updated.rowCount === 0) {
      throw new AppError('Booking not found', 404);
    }

    const booking = updated.rows[0];
    const session = await ensureScheduledSession(client, booking);
    const assignment = await ensureLearningStarted(client, booking);

    await logAudit({
      client,
      actor: req.user,
      action: 'booking.confirmed',
      entityType: 'booking',
      entityId: booking.id,
      targetUserId: booking.user_id,
      targetUserRole: 'learner',
      summary: `${req.user.role} confirmed booking ${booking.booking_number}`,
      metadata: {
        instructorId: booking.instructor_id,
        sessionId: session?.id || null,
        assignmentId: assignment?.id || null,
      },
    });

    return { booking, session, assignment };
  });

  res.json(result);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const existing = await query(`
    SELECT id, user_id, 
           EXTRACT(EPOCH FROM ((lesson_date + lesson_time) - NOW())) / 3600 AS hours_until_lesson
    FROM bookings 
    WHERE id = $1
  `, [req.params.id]);
  
  if (existing.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  const booking = existing.rows[0];
  await assertCanAccessBooking(booking, req.user, 'cancel');

  if (req.user.role === 'learner' && booking.hours_until_lesson !== null) {
    if (booking.hours_until_lesson < 24) {
      throw new AppError('You can only cancel a booking up to 24 hours before the lesson starts', 400);
    }
  }

  const result = await query(
    `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [req.params.id]
  );

  await logAudit({
    actor: req.user,
    action: 'booking.cancelled',
    entityType: 'booking',
    entityId: result.rows[0].id,
    targetUserId: result.rows[0].user_id,
    targetUserRole: 'learner',
    summary: `${req.user.role} cancelled booking ${result.rows[0].booking_number}`,
    metadata: { instructorId: result.rows[0].instructor_id },
  });

  res.json({ booking: result.rows[0] });
});
