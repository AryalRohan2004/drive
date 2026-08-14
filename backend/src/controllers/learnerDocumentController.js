import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query } from '../config/db.js';
import { logAudit } from '../utils/auditLogger.js';

const schema = z.object({
  documentType: z.string().min(2),
  fileUrl: z.string().optional().nullable(),
  status: z.enum(['pending', 'submitted', 'verified', 'rejected', 'needs_update']).optional(),
});

export const createLearnerDocument = asyncHandler(async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message || 'Invalid document payload', 400);
  
  const result = await query(
    `INSERT INTO learner_documents (id, student_id, document_type, file_url, status)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [crypto.randomUUID(), req.user.id, parsed.data.documentType, parsed.data.fileUrl || null, parsed.data.status || 'pending']
  );
  await logAudit({
    actor: req.user,
    action: 'learner_document.created',
    entityType: 'learner_document',
    entityId: result.rows[0].id,
    targetUserId: req.user.id,
    targetUserRole: 'learner',
    summary: 'Learner uploaded/submitted a document',
    metadata: {
      documentType: result.rows[0].document_type,
      status: result.rows[0].status,
    },
  });
  res.status(201).json({ learnerDocument: result.rows[0] });
});

export const getMyLearnerDocuments = asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM learner_documents WHERE student_id = $1 ORDER BY created_at DESC', [req.user.id]);
  res.json({ learnerDocuments: result.rows });
});

export const updateLearnerDocumentStatus = asyncHandler(async (req, res) => {
  const parsed = z.object({
    status: z.enum(['pending', 'submitted', 'verified', 'rejected', 'needs_update']),
    rejectionReason: z.string().optional().nullable(),
  }).safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message || 'Invalid document status payload', 400);

  const documentResult = await query(
    `SELECT ld.id, ld.student_id, ld.document_type, ld.file_url, ld.status, ld.rejection_reason, ld.verified_by, ld.created_at, ld.updated_at,
            u.status AS student_status
     FROM learner_documents ld
     LEFT JOIN users u ON u.id = ld.student_id
     WHERE ld.id = $1`,
    [req.params.id]
  );

  if (documentResult.rowCount === 0) {
    throw new AppError('Document not found', 404);
  }

  const document = documentResult.rows[0];

  if (req.user.role === 'instructor') {
    const assignmentResult = await query(
      `SELECT id
       FROM student_assignments
       WHERE student_id = $1
         AND instructor_id = $2
         AND status = 'active'
       ORDER BY started_at DESC
       LIMIT 1`,
      [document.student_id, req.user.id]
    );

    if (req.user.status !== 'active' || assignmentResult.rowCount === 0) {
      throw new AppError('Only an active assigned instructor can update this learner document', 403);
    }
  }

  const result = await query(
    `UPDATE learner_documents SET status = $1, rejection_reason = $2, verified_by = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
    [parsed.data.status, parsed.data.rejectionReason || null, req.user.id, req.params.id]
  );

  await logAudit({
    actor: req.user,
    action: `learner_document.${parsed.data.status}`,
    entityType: 'learner_document',
    entityId: result.rows[0].id,
    targetUserId: result.rows[0].student_id,
    targetUserRole: 'learner',
    summary: `${req.user.role} changed learner document to ${parsed.data.status}`,
    metadata: {
      documentType: result.rows[0].document_type,
      rejectionReason: parsed.data.rejectionReason || null,
    },
  });
  res.json({ learnerDocument: result.rows[0] });
});
