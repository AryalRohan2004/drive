import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query } from '../config/db.js';

const packageSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative(),
  durationMinutes: z.coerce.number().int().positive().default(90),
  category: z.string().min(2),
  isActive: z.boolean().optional().default(true),
  includedItems: z.array(z.string()).optional().default([]),
});

const mapPackage = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  durationMinutes: row.duration_minutes,
  category: row.category,
  isActive: row.is_active,
  includedItems: row.included_items || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listPackages = asyncHandler(async (_req, res) => {
  const result = await query(
    'SELECT id, code, name, description, price, duration_minutes, category, is_active, included_items, created_at, updated_at FROM lesson_packages WHERE is_active = TRUE ORDER BY category, price'
  );
  res.json({ packages: result.rows.map(mapPackage) });
});

export const getPackageByCode = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, code, name, description, price, duration_minutes, category, is_active, included_items, created_at, updated_at FROM lesson_packages WHERE code = $1',
    [req.params.code]
  );

  if (result.rowCount === 0) {
    throw new AppError('Package not found', 404);
  }

  res.json({ package: mapPackage(result.rows[0]) });
});

export const createPackage = asyncHandler(async (req, res) => {
  const parsed = packageSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid package payload', 400);
  }

  const data = parsed.data;
  const result = await query(
    `INSERT INTO lesson_packages (id, code, name, description, price, duration_minutes, category, is_active, included_items)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
     RETURNING id, code, name, description, price, duration_minutes, category, is_active, included_items, created_at, updated_at`,
    [crypto.randomUUID(), data.code, data.name, data.description || null, data.price, data.durationMinutes, data.category, data.isActive, JSON.stringify(data.includedItems)]
  );

  res.status(201).json({ package: mapPackage(result.rows[0]) });
});

export const updatePackage = asyncHandler(async (req, res) => {
  const parsed = packageSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid package payload', 400);
  }

  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(parsed.data)) {
    const columnMap = {
      code: 'code',
      name: 'name',
      description: 'description',
      price: 'price',
      durationMinutes: 'duration_minutes',
      category: 'category',
      isActive: 'is_active',
      includedItems: 'included_items',
    };
    if (key === 'includedItems') {
      fields.push(`${columnMap[key]} = $${idx++}::jsonb`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${columnMap[key]} = $${idx++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    throw new AppError('No changes submitted', 400);
  }

  values.push(req.params.id);

  const result = await query(
    `UPDATE lesson_packages
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${idx}
     RETURNING id, code, name, description, price, duration_minutes, category, is_active, included_items, created_at, updated_at`,
    values
  );

  if (result.rowCount === 0) {
    throw new AppError('Package not found', 404);
  }

  res.json({ package: mapPackage(result.rows[0]) });
});

export const deletePackage = asyncHandler(async (req, res) => {
  const result = await query('UPDATE lesson_packages SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id', [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    throw new AppError('Package not found', 404);
  }

  res.status(204).send();
});
