import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { query, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

const mapBookingSummary = (row) => ({
  id: row.id,
  bookingNumber: row.booking_number,
  lessonDate: row.lesson_date,
  lessonTime: row.lesson_time,
  status: row.status,
  packageName: row.package_name,
  vehicleType: row.vehicle_type,
});

const runInTransaction = async (fn) => withTransaction((client) => fn(client));

export const learnerDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const upcoming = await query(
    `SELECT b.*, p.name AS package_name
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     WHERE b.user_id = $1 AND b.status IN ('pending', 'confirmed')
     ORDER BY b.lesson_date ASC, b.lesson_time ASC
     LIMIT 1`,
    [userId]
  );

  const history = await query(
    `SELECT b.*, p.name AS package_name
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     WHERE b.user_id = $1
     ORDER BY b.lesson_date DESC, b.lesson_time DESC
     LIMIT 20`,
    [userId]
  );

  const progress = await query(
    'SELECT id, skill_name, vehicle_type, status, percent_complete, notes, updated_at FROM student_progress WHERE student_id = $1 ORDER BY updated_at DESC, created_at DESC',
    [userId]
  );

  const notes = await query(
    `SELECT i.note, i.created_at, u.full_name AS instructor_name, i.vehicle_type
     FROM instructor_notes i
     LEFT JOIN users u ON u.id = i.instructor_id
     WHERE i.student_id = $1
     ORDER BY i.created_at DESC
     LIMIT 10`,
    [userId]
  );

  const stats = await query(
    'SELECT COALESCE(SUM(price), 0) AS total_spent, COUNT(*)::int AS lesson_count FROM bookings WHERE user_id = $1 AND status = $2',
    [userId, 'completed']
  );
  const user = await query(
    'SELECT logbook_hours, progress_percent, documentation_status, preferred_vehicle_type, pickup_address, pickup_suburb FROM users WHERE id = $1',
    [userId]
  );
  const assignment = await query(
    `SELECT * FROM student_assignments WHERE student_id = $1 AND status = 'active' ORDER BY started_at DESC LIMIT 1`,
    [userId]
  );
  const documents = await query(
    `SELECT id, document_type, file_url, status, rejection_reason, created_at, updated_at
     FROM learner_documents WHERE student_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  const transfers = await query(
    `SELECT * FROM transfer_requests WHERE student_id = $1 ORDER BY requested_at DESC LIMIT 10`,
    [userId]
  );

  res.json({
    upcomingLesson: upcoming.rows[0] ? mapBookingSummary(upcoming.rows[0]) : null,
    progressPercent: user.rows[0]?.progress_percent ?? 0,
    hoursLogged: user.rows[0]?.logbook_hours ?? 0,
    documentationStatus: user.rows[0]?.documentation_status ?? 'pending',
    preferredVehicleType: user.rows[0]?.preferred_vehicle_type ?? null,
    pickupAddress: user.rows[0]?.pickup_address ?? null,
    pickupSuburb: user.rows[0]?.pickup_suburb ?? null,
    activeAssignment: assignment.rows[0] || null,
    completedLessons: stats.rows[0]?.lesson_count ?? 0,
    totalSpent: Number(stats.rows[0]?.total_spent || 0),
    skills: progress.rows,
    lessonHistory: history.rows.map(mapBookingSummary),
    instructorNotes: notes.rows,
    learnerDocuments: documents.rows,
    transferRequests: transfers.rows,
  });
});

export const instructorDashboard = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;

  const todayLessons = await query(
    `SELECT b.*, p.name AS package_name, COALESCE(b.guest_name, u.full_name) AS student_name
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     LEFT JOIN users u ON u.id = b.user_id
     WHERE b.instructor_id = $1 AND b.lesson_date = CURRENT_DATE
     ORDER BY b.lesson_time ASC`,
    [instructorId]
  );

  const students = await query(
    `SELECT DISTINCT u.id, u.full_name, u.email, u.progress_percent, u.logbook_hours, p.name AS package_name, a.vehicle_type, a.status AS assignment_status
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     LEFT JOIN student_assignments a ON a.student_id = u.id AND a.status = 'active'
     WHERE b.instructor_id = $1 AND u.role = 'learner'
     ORDER BY u.full_name ASC`,
    [instructorId]
  );

  const incomingRequests = await query(
    `SELECT tr.*, u.full_name AS student_name
     FROM training_requests tr
     LEFT JOIN users u ON u.id = tr.student_id
     WHERE tr.instructor_id = $1
     ORDER BY tr.created_at DESC`,
    [instructorId]
  );

  const assignments = await query(
    `SELECT * FROM student_assignments WHERE instructor_id = $1 ORDER BY started_at DESC`,
    [instructorId]
  );

  const stats = await query(
    `SELECT
       COUNT(DISTINCT user_id)::int AS active_students,
       COALESCE(SUM(CASE WHEN lesson_date = CURRENT_DATE THEN 1 ELSE 0 END), 0)::int AS lessons_today,
       COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0)::int AS completed_lessons
     FROM bookings
     WHERE instructor_id = $1`,
    [instructorId]
  );

  const transferRequests = await query(
    `SELECT * FROM transfer_requests WHERE from_instructor_id = $1 OR to_instructor_id = $1 ORDER BY requested_at DESC`,
    [instructorId]
  );

  res.json({
    todayLessons: todayLessons.rows,
    students: students.rows,
    incomingTrainingRequests: incomingRequests.rows,
    assignments: assignments.rows,
    transferRequests: transferRequests.rows,
    quickStats: stats.rows[0],
  });
});

export const completeLesson = asyncHandler(async (req, res) => {
  const body = z.object({
    notes: z.string().optional().nullable(),
    logbookHoursAdded: z.coerce.number().int().min(0).optional().default(0),
    progressPercentChange: z.coerce.number().int().min(0).optional().default(0),
  }).safeParse(req.body || {});

  if (!body.success) {
    throw new AppError(body.error.issues[0]?.message || 'Invalid lesson completion payload', 400);
  }

  const bookingId = req.params.id;

  const bookingResult = await query(
    `SELECT * FROM bookings WHERE id = $1`,
    [bookingId]
  );
  if (bookingResult.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  const booking = bookingResult.rows[0];
  if (req.user.role !== 'admin' && booking.instructor_id !== req.user.id) {
    throw new AppError('You do not have permission to complete this lesson', 403);
  }

  const sessionDate = booking.lesson_date;

  const completed = await runInTransaction(async (client) => {
    const updated = await client.query(
      `UPDATE bookings
       SET status = 'completed',
           payment_status = CASE WHEN payment_status = 'unpaid' THEN 'paid' ELSE payment_status END,
           updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [bookingId]
    );

    const existingSession = await client.query('SELECT id FROM lesson_sessions WHERE booking_id = $1 LIMIT 1', [bookingId]);
    if (existingSession.rowCount === 0) {
      await client.query(
        `INSERT INTO lesson_sessions (id, booking_id, student_id, instructor_id, session_date, start_time, end_time, location, lesson_type, vehicle_type, status, notes)
         VALUES ($1,$2,$3,$4,$5::date,$6::time,$7::time,$8,$9,$10,'completed',$11)`,
        [
          crypto.randomUUID(),
          bookingId,
          booking.user_id,
          booking.instructor_id,
          sessionDate,
          booking.lesson_time,
          booking.lesson_time,
          booking.pickup_address || booking.pickup_suburb || null,
          booking.booking_type,
          booking.vehicle_type || null,
          body.data.notes || null,
        ]
      );
    }

    if (booking.user_id && (body.data.logbookHoursAdded > 0 || body.data.progressPercentChange > 0)) {
      await client.query(
        `UPDATE users
         SET logbook_hours = logbook_hours + $1,
             progress_percent = LEAST(100, progress_percent + $2),
             updated_at = NOW()
         WHERE id = $3`,
        [body.data.logbookHoursAdded, body.data.progressPercentChange, booking.user_id]
      );
    }

    return updated.rows[0];
  });

  res.json({ booking: completed });
});

export const updateLearnerProgress = asyncHandler(async (req, res) => {
  const parsed = z.object({
    studentId: z.string().optional().nullable(),
    skillName: z.string().min(2),
    vehicleType: z.string().optional().nullable(),
    status: z.string().optional().default('in_progress'),
    percentComplete: z.coerce.number().int().min(0).max(100).optional().default(0),
    notes: z.string().optional().nullable(),
    logbookHoursDelta: z.coerce.number().int().min(0).optional().default(0),
    progressPercent: z.coerce.number().int().min(0).max(100).optional(),
  }).safeParse(req.body || {});

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid progress payload', 400);
  }

  const learnerId = req.user.role === 'learner' ? req.user.id : parsed.data.studentId || req.user.id;
  const data = parsed.data;

  const result = await runInTransaction(async (client) => {
    const existing = await client.query(
      `SELECT id FROM student_progress WHERE student_id = $1 AND skill_name = $2 AND COALESCE(vehicle_type, '') = COALESCE($3, '') LIMIT 1`,
      [learnerId, data.skillName, data.vehicleType || null]
    );

    if (existing.rowCount > 0) {
      await client.query(
        `UPDATE student_progress
         SET status = $1,
             percent_complete = $2,
             vehicle_type = $6,
             last_updated_by = $3,
             notes = COALESCE($4, notes),
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [data.status, data.percentComplete, req.user.id, data.notes || null, existing.rows[0].id, data.vehicleType || null]
      );
    } else {
      await client.query(
        `INSERT INTO student_progress (id, student_id, skill_name, vehicle_type, status, percent_complete, last_updated_by, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [crypto.randomUUID(), learnerId, data.skillName, data.vehicleType || null, data.status, data.percentComplete, req.user.id, data.notes || null]
      );
    }

    if (data.logbookHoursDelta > 0 || data.progressPercent !== undefined) {
      await client.query(
        `UPDATE users
         SET logbook_hours = logbook_hours + $1,
             progress_percent = COALESCE($2, progress_percent),
             updated_at = NOW()
         WHERE id = $3`,
        [data.logbookHoursDelta, data.progressPercent ?? null, learnerId]
      );
    }

    return client.query(
      `SELECT id, skill_name, vehicle_type, status, percent_complete, notes, updated_at
       FROM student_progress WHERE student_id = $1 ORDER BY updated_at DESC, created_at DESC`,
      [learnerId]
    );
  });

  res.json({ skills: result.rows });
});
