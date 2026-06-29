import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query, withTransaction } from '../config/db.js';
import { logAudit } from '../utils/auditLogger.js';

const schema = z.object({
  instructorId: z.string().min(1),
  vehicleType: z.string().min(1),
  packageId: z.string().optional().nullable(),
  preferredDate: z.string().date().optional().nullable(),
  preferredTime: z.string().optional().nullable(),
  pickupAddress: z.string().optional().nullable(),
  pickupSuburb: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

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

const assertInstructorSessionAvailable = async (client, instructorId, date, time) => {
  if (!date || !time) return;

  const requestedStart = parseTimeToMinutes(time);
  if (requestedStart === null) {
    throw new AppError('Preferred time is invalid', 400);
  }
  const requestedEnd = requestedStart + 60;

  const existing = await client.query(
    `SELECT b.lesson_time, COALESCE(p.duration_minutes, 60) AS duration_minutes
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     WHERE b.lesson_date = $1::date
       AND b.instructor_id = $2
       AND b.status IN ('pending', 'confirmed')
     UNION ALL
     SELECT ls.start_time AS lesson_time, 60 AS duration_minutes
     FROM lesson_sessions ls
     WHERE ls.session_date = $1::date
       AND ls.instructor_id = $2
       AND ls.status IN ('scheduled', 'in_progress')`,
    [date, instructorId]
  );

  const conflict = existing.rows.find((slot) => {
    const bookedStart = parseTimeToMinutes(slot.lesson_time);
    if (bookedStart === null) return false;
    return rangesOverlap(requestedStart, requestedEnd, bookedStart, bookedStart + Number(slot.duration_minutes || 60));
  });

  if (conflict) {
    throw new AppError('That instructor is already booked for the requested time', 409);
  }
};

export const listTrainingRequests = asyncHandler(async (req, res) => {
  const filters = [];
  const values = [];
  let idx = 1;
  if (req.user.role === 'learner') {
    filters.push(`student_id = $${idx++}`);
    values.push(req.user.id);
  } else if (req.user.role === 'instructor') {
    filters.push(`instructor_id = $${idx++}`);
    values.push(req.user.id);
  }
  if (req.query.status) {
    filters.push(`status = $${idx++}`);
    values.push(req.query.status);
  }
  const result = await query(`SELECT * FROM training_requests ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''} ORDER BY created_at DESC`, values);
  res.json({ trainingRequests: result.rows });
});

export const getTrainingRequestById = asyncHandler(async (req, res) => {
  const result = await query(`SELECT * FROM training_requests WHERE id = $1`, [req.params.id]);
  if (result.rowCount === 0) throw new AppError('Training request not found', 404);

  const row = result.rows[0];
  if (req.user.role !== 'admin' && req.user.id !== row.student_id && req.user.id !== row.instructor_id) {
    throw new AppError('You do not have permission to view this request', 403);
  }

  res.json({ trainingRequest: row });
});

export const createTrainingRequest = asyncHandler(async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message || 'Invalid training request payload', 400);
  const data = parsed.data;
  const result = await query(
    `INSERT INTO training_requests (id, student_id, instructor_id, vehicle_type, package_id, preferred_date, preferred_time, pickup_address, pickup_suburb, message)
     VALUES ($1,$2,$3,$4,$5,$6::date,$7,$8,$9,$10) RETURNING *`,
    [crypto.randomUUID(), req.user.id, data.instructorId, data.vehicleType, data.packageId || null, data.preferredDate || null, data.preferredTime || null, data.pickupAddress || null, data.pickupSuburb || null, data.message || null]
  );
  await logAudit({
    actor: req.user,
    action: 'training_request.created',
    entityType: 'training_request',
    entityId: result.rows[0].id,
    targetUserId: req.user.id,
    targetUserRole: 'learner',
    summary: 'Learner requested training with instructor',
    metadata: {
      instructorId: data.instructorId,
      vehicleType: data.vehicleType,
      preferredDate: data.preferredDate || null,
      preferredTime: data.preferredTime || null,
    },
  });
  res.status(201).json({ trainingRequest: result.rows[0] });
});

const updateStatus = async (req, res, status) => {
  const responseMessage = req.body?.responseMessage || null;
  const existing = await query('SELECT id, instructor_id FROM training_requests WHERE id = $1', [req.params.id]);
  if (existing.rowCount === 0) throw new AppError('Training request not found', 404);
  if (req.user.role !== 'admin' && req.user.id !== existing.rows[0].instructor_id) {
    throw new AppError('You do not have permission to update this request', 403);
  }
  const result = await query(
    `UPDATE training_requests SET status = $1, response_message = $2, responded_at = NOW(), updated_at = NOW() WHERE id = $3 RETURNING *`,
    [status, responseMessage, req.params.id]
  );
  await logAudit({
    actor: req.user,
    action: `training_request.${status}`,
    entityType: 'training_request',
    entityId: result.rows[0].id,
    targetUserId: result.rows[0].student_id,
    targetUserRole: 'learner',
    summary: `${req.user.role} changed training request to ${status}`,
    metadata: {
      instructorId: result.rows[0].instructor_id,
      responseMessage,
    },
  });
  res.json({ trainingRequest: result.rows[0] });
};

export const acceptTrainingRequest = asyncHandler(async (req, res) => {
  const result = await withTransaction(async (client) => {
    const request = await client.query('SELECT * FROM training_requests WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (request.rowCount === 0) throw new AppError('Training request not found', 404);

    const row = request.rows[0];
    if (req.user.role !== 'admin' && req.user.id !== row.instructor_id) {
      throw new AppError('You do not have permission to accept this request', 403);
    }

    await assertInstructorSessionAvailable(client, row.instructor_id, row.preferred_date, row.preferred_time);

    const activeAssignment = await client.query(
      `SELECT * FROM student_assignments WHERE student_id = $1 AND status = 'active' ORDER BY started_at DESC LIMIT 1`,
      [row.student_id]
    );

    if (activeAssignment.rowCount > 0) {
      await client.query(
        `UPDATE student_assignments SET status = 'transferred', ended_at = NOW() WHERE id = $1`,
        [activeAssignment.rows[0].id]
      );
    }

    const result = await client.query(
      `UPDATE training_requests SET status = 'accepted', responded_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    const assignmentResult = await client.query(
      `INSERT INTO student_assignments (id, student_id, instructor_id, vehicle_type, status, source_training_request_id)
       VALUES ($1,$2,$3,$4,'active',$5)
       RETURNING *`,
      [crypto.randomUUID(), row.student_id, row.instructor_id, row.vehicle_type, row.id]
    );

    await client.query(
      `UPDATE users SET learning_status = 'active', updated_at = NOW() WHERE id = $1`,
      [row.student_id]
    );

    if (row.preferred_date && row.preferred_time) {
      await client.query(
        `INSERT INTO lesson_sessions (id, student_id, instructor_id, session_date, start_time, end_time, lesson_type, vehicle_type, status, notes)
         VALUES ($1,$2,$3,$4::date,$5::time,$6::time,$7,$8,'scheduled',$9)`,
        [
          crypto.randomUUID(),
          row.student_id,
          row.instructor_id,
          row.preferred_date,
          row.preferred_time,
          addMinutesToTime(row.preferred_time, 60),
          'training-request',
          row.vehicle_type,
          row.message || null,
        ]
      );
    }

    await logAudit({
      client,
      actor: req.user,
      action: 'training_request.accepted',
      entityType: 'training_request',
      entityId: result.rows[0].id,
      targetUserId: row.student_id,
      targetUserRole: 'learner',
      summary: `${req.user.role} accepted training request`,
      metadata: {
        instructorId: row.instructor_id,
        assignmentId: assignmentResult.rows[0].id,
        vehicleType: row.vehicle_type,
      },
    });

    return { trainingRequest: result.rows[0], assignment: assignmentResult.rows[0] };
  });

  res.json(result);
});

export const rejectTrainingRequest = asyncHandler(async (req, res) => updateStatus(req, res, 'rejected'));
export const moreInfoTrainingRequest = asyncHandler(async (req, res) => updateStatus(req, res, 'more_info_required'));
