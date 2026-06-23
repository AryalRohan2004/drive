import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';

export const listAuditLogs = asyncHandler(async (req, res) => {
  const filters = [];
  const values = [];
  let idx = 1;

  if (req.query.actorRole) {
    filters.push(`actor_role = $${idx++}`);
    values.push(req.query.actorRole);
  }

  if (req.query.targetUserRole) {
    filters.push(`target_user_role = $${idx++}`);
    values.push(req.query.targetUserRole);
  }

  if (req.query.action) {
    filters.push(`action = $${idx++}`);
    values.push(req.query.action);
  }

  if (req.query.entityType) {
    filters.push(`entity_type = $${idx++}`);
    values.push(req.query.entityType);
  }

  if (req.query.actorId) {
    filters.push(`actor_id = $${idx++}`);
    values.push(req.query.actorId);
  }

  if (req.query.targetUserId) {
    filters.push(`target_user_id = $${idx++}`);
    values.push(req.query.targetUserId);
  }

  if (req.query.from) {
    filters.push(`created_at >= $${idx++}::timestamptz`);
    values.push(req.query.from);
  }

  if (req.query.to) {
    filters.push(`created_at <= $${idx++}::timestamptz`);
    values.push(req.query.to);
  }

  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
  const offset = (page - 1) * limit;

  const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const result = await query(
    `SELECT id, actor_id, actor_role, actor_name, action, entity_type, entity_id,
            target_user_id, target_user_role, summary, metadata, created_at
     FROM audit_logs
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset]
  );

  const total = await query(
    `SELECT COUNT(*)::int AS count FROM audit_logs ${whereSql}`,
    values
  );

  res.json({
    page,
    limit,
    total: total.rows[0]?.count || 0,
    logs: result.rows,
  });
});
