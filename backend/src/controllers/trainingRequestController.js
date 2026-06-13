import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query, withTransaction } from '../config/db.js';

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
          row.preferred_time,
          'training-request',
          row.vehicle_type,
          row.message || null,
        ]
      );
    }

    return { trainingRequest: result.rows[0], assignment: assignmentResult.rows[0] };
  });

  res.json(result);
});

export const rejectTrainingRequest = asyncHandler(async (req, res) => updateStatus(req, res, 'rejected'));
export const moreInfoTrainingRequest = asyncHandler(async (req, res) => updateStatus(req, res, 'more_info_required'));
