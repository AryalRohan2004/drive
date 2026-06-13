import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query } from '../config/db.js';

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
  const result = await query(
    `UPDATE learner_documents SET status = $1, rejection_reason = $2, verified_by = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
    [parsed.data.status, parsed.data.rejectionReason || null, req.user.id, req.params.id]
  );
  if (result.rowCount === 0) throw new AppError('Document not found', 404);
  res.json({ learnerDocument: result.rows[0] });
});
