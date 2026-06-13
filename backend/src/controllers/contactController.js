import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query } from '../config/db.js';
import { sendEmail } from '../services/emailService.js';
import { env } from '../config/env.js';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  message: z.string().min(10),
});

export const submitContact = asyncHandler(async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid contact payload', 400);
  }

  const data = parsed.data;
  const result = await query(
    `INSERT INTO contact_requests (id, name, email, phone, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, message, status, created_at`,
    [crypto.randomUUID(), data.name, data.email.toLowerCase(), data.phone || null, data.message]
  );

  await sendEmail({
    to: env.adminNotifyEmail,
    subject: 'New SANOS contact request',
    text: `New contact message from ${data.name} (${data.email}): ${data.message}`,
    html: `<p><strong>${data.name}</strong> (${data.email})</p><p>${data.message}</p>`,
  });

  res.status(201).json({ contactRequest: result.rows[0] });
});

export const listContactRequests = asyncHandler(async (_req, res) => {
  const result = await query(
    'SELECT id, name, email, phone, message, status, created_at, updated_at FROM contact_requests ORDER BY created_at DESC'
  );
  res.json({ contactRequests: result.rows });
});

export const updateContactRequest = asyncHandler(async (req, res) => {
  const parsed = z.object({
    status: z.enum(['new', 'in_progress', 'replied', 'closed']),
  }).safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid contact update payload', 400);
  }

  const result = await query(
    `UPDATE contact_requests SET status = $1, updated_at = NOW() WHERE id = $2
     RETURNING id, name, email, phone, message, status, created_at, updated_at`,
    [parsed.data.status, req.params.id]
  );

  if (result.rowCount === 0) {
    throw new AppError('Contact request not found', 404);
  }

  res.json({ contactRequest: result.rows[0] });
});
