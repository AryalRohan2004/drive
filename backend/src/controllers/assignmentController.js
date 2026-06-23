import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query, withTransaction } from '../config/db.js';
import { logAudit } from '../utils/auditLogger.js';

const runInTransaction = async (fn) => withTransaction((client) => fn(client));

export const getMyAssignments = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT * FROM student_assignments WHERE student_id = $1 OR instructor_id = $1 ORDER BY started_at DESC`,
    [req.user.id]
  );
  if (req.user.role === 'learner') {
    res.json({
      activeAssignment: result.rows.find((row) => row.status === 'active' && row.student_id === req.user.id) || null,
      assignments: result.rows,
    });
    return;
  }

  if (req.user.role === 'instructor') {
    res.json({
      assignedLearners: result.rows.filter((row) => row.instructor_id === req.user.id),
      assignments: result.rows,
    });
    return;
  }

  res.json({ assignments: result.rows });
});

export const createTransferRequest = asyncHandler(async (req, res) => {
  const parsed = z.object({
    toInstructorId: z.string().min(1),
    reason: z.string().optional().nullable(),
    packageBalanceTransferred: z.coerce.number().optional().default(0),
  }).safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message || 'Invalid transfer payload', 400);

  const current = await query(
    `SELECT * FROM student_assignments WHERE id = $1 AND student_id = $2 AND status = 'active'`,
    [req.params.id, req.user.id]
  );
  if (current.rowCount === 0) throw new AppError('Active assignment not found', 404);

  const progress = await query(
    `SELECT id, skill_name, status, percent_complete FROM student_progress WHERE student_id = $1 ORDER BY updated_at DESC, created_at DESC`,
    [req.user.id]
  );
  const profile = await query(
    `SELECT progress_percent, logbook_hours, learning_status, documentation_status FROM users WHERE id = $1`,
    [req.user.id]
  );

  const result = await query(
    `INSERT INTO transfer_requests (
      id, student_id, from_instructor_id, to_instructor_id, current_assignment_id, reason,
      progress_snapshot, hours_transferred, package_balance_transferred
    )
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9)
     RETURNING *`,
    [
      crypto.randomUUID(),
      req.user.id,
      current.rows[0].instructor_id,
      parsed.data.toInstructorId,
      current.rows[0].id,
      parsed.data.reason || null,
      JSON.stringify({
        progressPercent: profile.rows[0]?.progress_percent ?? 0,
        logbookHours: profile.rows[0]?.logbook_hours ?? 0,
        learningStatus: profile.rows[0]?.learning_status ?? 'not_started',
        documentationStatus: profile.rows[0]?.documentation_status ?? 'pending',
        skills: progress.rows,
      }),
      profile.rows[0]?.logbook_hours ?? 0,
      parsed.data.packageBalanceTransferred,
    ]
  );

  await logAudit({
    actor: req.user,
    action: 'transfer.requested',
    entityType: 'transfer_request',
    entityId: result.rows[0].id,
    targetUserId: req.user.id,
    targetUserRole: 'learner',
    summary: 'Learner requested instructor transfer',
    metadata: {
      fromInstructorId: current.rows[0].instructor_id,
      toInstructorId: parsed.data.toInstructorId,
      currentAssignmentId: current.rows[0].id,
    },
  });

  res.status(201).json({ transferRequest: result.rows[0] });
});

export const listTransferRequests = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT * FROM transfer_requests
     WHERE student_id = $1 OR from_instructor_id = $1 OR to_instructor_id = $1 OR $2::text = 'admin'
     ORDER BY requested_at DESC`,
    [req.user.id, req.user.role]
  );
  res.json({ transferRequests: result.rows });
});

export const getTransferRequestById = asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM transfer_requests WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) throw new AppError('Transfer request not found', 404);
  const row = result.rows[0];
  if (req.user.role !== 'admin' && ![row.student_id, row.from_instructor_id, row.to_instructor_id].includes(req.user.id)) {
    throw new AppError('You do not have permission to view this transfer request', 403);
  }
  res.json({ transferRequest: row });
});

const loadTransferRequest = async (client, id) => {
  const result = await client.query('SELECT * FROM transfer_requests WHERE id = $1 FOR UPDATE', [id]);
  if (result.rowCount === 0) {
    throw new AppError('Transfer request not found', 404);
  }
  return result.rows[0];
};

const createReplacementAssignment = async (client, transferRequest, currentAssignment, status = 'active') => {
  const assignmentResult = await client.query(
    `INSERT INTO student_assignments (id, student_id, instructor_id, vehicle_type, status, source_training_request_id, started_at)
     VALUES ($1,$2,$3,$4,$5,$6,NOW())
     RETURNING *`,
    [
      crypto.randomUUID(),
      transferRequest.student_id,
      transferRequest.to_instructor_id,
      currentAssignment.vehicle_type,
      status,
      currentAssignment.source_training_request_id || null,
    ]
  );
  await client.query(
    `UPDATE users SET learning_status = $2, updated_at = NOW() WHERE id = $1`,
    [transferRequest.student_id, status === 'active' ? 'active' : 'transferred']
  );
  return assignmentResult.rows[0];
};

export const approveTransferRequest = asyncHandler(async (req, res) => {
  const payload = z.object({
    reason: z.string().optional().nullable(),
  }).safeParse(req.body || {});
  if (!payload.success) throw new AppError(payload.error.issues[0]?.message || 'Invalid payload', 400);

  const result = await runInTransaction(async (client) => {
    const transfer = await loadTransferRequest(client, req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== transfer.to_instructor_id) {
      throw new AppError('You do not have permission to approve this transfer request', 403);
    }

    if (transfer.new_assignment_id) {
      const existingAssignment = await client.query(
        `SELECT * FROM student_assignments WHERE id = $1`,
        [transfer.new_assignment_id]
      );
      const updatedTransfer = await client.query(
        `UPDATE transfer_requests
         SET status = 'approved',
             response_message = COALESCE($2, response_message),
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [transfer.id, payload.data.reason || null]
      );
      return { transferRequest: updatedTransfer.rows[0], assignment: existingAssignment.rows[0] || null };
    }

    const currentAssignmentResult = await client.query(
      `SELECT * FROM student_assignments WHERE id = $1 FOR UPDATE`,
      [transfer.current_assignment_id]
    );
    if (currentAssignmentResult.rowCount === 0) {
      throw new AppError('Current assignment not found', 404);
    }

    await client.query(
      `UPDATE student_assignments SET status = 'transferred', ended_at = NOW() WHERE id = $1`,
      [currentAssignmentResult.rows[0].id]
    );

    const newAssignment = await createReplacementAssignment(client, transfer, currentAssignmentResult.rows[0], 'active');

    const updatedTransfer = await client.query(
      `UPDATE transfer_requests
       SET status = 'approved',
           new_assignment_id = $2,
           response_message = COALESCE($3, response_message),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [transfer.id, newAssignment.id, payload.data.reason || null]
    );

    await logAudit({
      client,
      actor: req.user,
      action: 'transfer.approved',
      entityType: 'transfer_request',
      entityId: updatedTransfer.rows[0].id,
      targetUserId: transfer.student_id,
      targetUserRole: 'learner',
      summary: `${req.user.role} approved learner transfer`,
      metadata: {
        fromInstructorId: transfer.from_instructor_id,
        toInstructorId: transfer.to_instructor_id,
        newAssignmentId: newAssignment.id,
      },
    });

    return { transferRequest: updatedTransfer.rows[0], assignment: newAssignment };
  });

  res.json(result);
});

export const rejectTransferRequest = asyncHandler(async (req, res) => {
  const payload = z.object({
    reason: z.string().optional().nullable(),
  }).safeParse(req.body || {});
  if (!payload.success) throw new AppError(payload.error.issues[0]?.message || 'Invalid payload', 400);

  const result = await runInTransaction(async (client) => {
    const transfer = await loadTransferRequest(client, req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== transfer.to_instructor_id) {
      throw new AppError('You do not have permission to reject this transfer request', 403);
    }

    const updated = await client.query(
      `UPDATE transfer_requests
       SET status = 'rejected', response_message = $2, responded_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [transfer.id, payload.data.reason || null]
    );

    await logAudit({
      client,
      actor: req.user,
      action: 'transfer.rejected',
      entityType: 'transfer_request',
      entityId: updated.rows[0].id,
      targetUserId: transfer.student_id,
      targetUserRole: 'learner',
      summary: `${req.user.role} rejected learner transfer`,
      metadata: {
        fromInstructorId: transfer.from_instructor_id,
        toInstructorId: transfer.to_instructor_id,
        reason: payload.data.reason || null,
      },
    });

    return { transferRequest: updated.rows[0] };
  });

  res.json(result);
});

export const completeTransferRequest = asyncHandler(async (req, res) => {
  const result = await runInTransaction(async (client) => {
    const transfer = await loadTransferRequest(client, req.params.id);
    if (req.user.role !== 'admin' && ![transfer.student_id, transfer.to_instructor_id].includes(req.user.id)) {
      throw new AppError('You do not have permission to complete this transfer request', 403);
    }

    let newAssignmentId = transfer.new_assignment_id;
    if (!newAssignmentId) {
      const currentAssignmentResult = await client.query(
        `SELECT * FROM student_assignments WHERE id = $1 FOR UPDATE`,
        [transfer.current_assignment_id]
      );
      if (currentAssignmentResult.rowCount === 0) {
        throw new AppError('Current assignment not found', 404);
      }

      const currentAssignment = currentAssignmentResult.rows[0];
      await client.query(
        `UPDATE student_assignments SET status = 'transferred', ended_at = NOW() WHERE id = $1`,
        [currentAssignment.id]
      );
      const replacement = await createReplacementAssignment(client, transfer, currentAssignment, 'active');
      newAssignmentId = replacement.id;
    }

    const updated = await client.query(
      `UPDATE transfer_requests
       SET status = 'completed',
           new_assignment_id = $2,
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [transfer.id, newAssignmentId]
    );

    await logAudit({
      client,
      actor: req.user,
      action: 'transfer.completed',
      entityType: 'transfer_request',
      entityId: updated.rows[0].id,
      targetUserId: transfer.student_id,
      targetUserRole: 'learner',
      summary: `${req.user.role} completed learner transfer`,
      metadata: { newAssignmentId },
    });

    return { transferRequest: updated.rows[0], newAssignmentId };
  });

  res.json(result);
});
