import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query } from '../config/db.js';

const vehicleTypeSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  requiresDocumentVerification: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const listVehicleTypes = asyncHandler(async (_req, res) => {
  const result = await query(
    'SELECT id, code, name, description, requires_document_verification, is_active, created_at, updated_at FROM vehicle_types WHERE is_active = TRUE ORDER BY name ASC'
  );
  res.json({
    vehicleTypes: result.rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      requiresDocumentVerification: row.requires_document_verification,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
});

export const createVehicleType = asyncHandler(async (req, res) => {
  const parsed = vehicleTypeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message || 'Invalid vehicle type payload', 400);
  const data = parsed.data;
  const result = await query(
    `INSERT INTO vehicle_types (id, code, name, description, requires_document_verification, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, code, name, description, requires_document_verification, is_active, created_at, updated_at`,
    [crypto.randomUUID(), data.code, data.name, data.description || null, data.requiresDocumentVerification, data.isActive]
  );
  res.status(201).json({ vehicleType: result.rows[0] });
});

export const updateVehicleType = asyncHandler(async (req, res) => {
  const parsed = vehicleTypeSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message || 'Invalid vehicle type payload', 400);

  const map = {
    code: 'code',
    name: 'name',
    description: 'description',
    requiresDocumentVerification: 'requires_document_verification',
    isActive: 'is_active',
  };

  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, value] of Object.entries(parsed.data)) {
    fields.push(`${map[key]} = $${idx++}`);
    values.push(value);
  }

  if (!fields.length) throw new AppError('No changes submitted', 400);
  values.push(req.params.id);

  const result = await query(
    `UPDATE vehicle_types SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx}
     RETURNING id, code, name, description, requires_document_verification, is_active, created_at, updated_at`,
    values
  );

  if (result.rowCount === 0) throw new AppError('Vehicle type not found', 404);
  res.json({ vehicleType: result.rows[0] });
});
