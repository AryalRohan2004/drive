import crypto from 'crypto';
import { query } from '../config/db.js';

const getActorName = (actor) => actor?.full_name || actor?.fullName || actor?.email || null;

export const logAudit = async ({
  client = null,
  actor = null,
  action,
  entityType,
  entityId = null,
  targetUserId = null,
  targetUserRole = null,
  summary = null,
  metadata = {},
}) => {
  const runner = client || { query };
  await runner.query(
    `INSERT INTO audit_logs (
      id, actor_id, actor_role, actor_name, action, entity_type, entity_id,
      target_user_id, target_user_role, summary, metadata
    )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)`,
    [
      crypto.randomUUID(),
      actor?.id || null,
      actor?.role || null,
      getActorName(actor),
      action,
      entityType,
      entityId,
      targetUserId,
      targetUserRole,
      summary,
      JSON.stringify(metadata || {}),
    ]
  );
};
