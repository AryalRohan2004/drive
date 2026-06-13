import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query } from '../config/db.js';

const contentSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  content: z.string().default(''),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  isPublished: z.boolean().optional().default(true),
});

export const listContent = asyncHandler(async (_req, res) => {
  const result = await query(
    'SELECT id, slug, title, content, seo_title, seo_description, is_published, created_at, updated_at FROM content_pages ORDER BY slug ASC'
  );
  res.json({ contentPages: result.rows });
});

export const getContentBySlug = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, slug, title, content, seo_title, seo_description, is_published, created_at, updated_at FROM content_pages WHERE slug = $1',
    [req.params.slug]
  );

  if (result.rowCount === 0) {
    throw new AppError('Content page not found', 404);
  }

  res.json({ contentPage: result.rows[0] });
});

export const createContent = asyncHandler(async (req, res) => {
  const parsed = contentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid content payload', 400);
  }

  const data = parsed.data;
  const result = await query(
    `INSERT INTO content_pages (id, slug, title, content, seo_title, seo_description, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, slug, title, content, seo_title, seo_description, is_published, created_at, updated_at`,
    [crypto.randomUUID(), data.slug, data.title, data.content, data.seoTitle || data.title, data.seoDescription || '', data.isPublished]
  );

  res.status(201).json({ contentPage: result.rows[0] });
});

export const updateContent = asyncHandler(async (req, res) => {
  const parsed = contentSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid content payload', 400);
  }

  const map = {
    slug: 'slug',
    title: 'title',
    content: 'content',
    seoTitle: 'seo_title',
    seoDescription: 'seo_description',
    isPublished: 'is_published',
  };

  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, value] of Object.entries(parsed.data)) {
    fields.push(`${map[key]} = $${idx++}`);
    values.push(value);
  }

  if (fields.length === 0) {
    throw new AppError('No changes submitted', 400);
  }

  values.push(req.params.id);

  const result = await query(
    `UPDATE content_pages SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx}
     RETURNING id, slug, title, content, seo_title, seo_description, is_published, created_at, updated_at`,
    values
  );

  if (result.rowCount === 0) {
    throw new AppError('Content page not found', 404);
  }

  res.json({ contentPage: result.rows[0] });
});
