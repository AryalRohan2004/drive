ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "learning_status" TEXT NOT NULL DEFAULT 'not_started';
