-- DropIndex
DROP INDEX "audit_logs_action_created_at_idx";

-- DropIndex
DROP INDEX "audit_logs_actor_role_created_at_idx";

-- DropIndex
DROP INDEX "audit_logs_target_user_role_created_at_idx";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "metadata" DROP DEFAULT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "stripe_payment_intent_id" TEXT,
ADD COLUMN     "stripe_session_id" TEXT;

-- CreateTable
CREATE TABLE "instructor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "languages_spoken" TEXT,
    "profile_photo_url" TEXT,
    "accreditation_number" TEXT,
    "license_expiry" DATE,
    "has_wwcc" BOOLEAN NOT NULL DEFAULT false,
    "has_police_clearance" BOOLEAN NOT NULL DEFAULT false,
    "services_offered" JSONB,
    "days_available" TEXT,
    "times_available" TEXT,
    "pickup_locations" TEXT,
    "vehicle_make_model" TEXT,
    "vehicle_transmission" TEXT,
    "has_dual_control" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_photo_url" TEXT,
    "price_1hr" DECIMAL(10,2),
    "price_2hr" DECIMAL(10,2),
    "price_test_package" DECIMAL(10,2),
    "special_packages" TEXT,
    "bank_details" TEXT,
    "abn" TEXT,
    "years_experience" INTEGER,
    "students_taught" INTEGER,
    "social_links" TEXT,
    "testimonials_text" TEXT,
    "agreed_commission" BOOLEAN NOT NULL DEFAULT false,
    "agreed_terms" BOOLEAN NOT NULL DEFAULT false,
    "agreed_cancellation" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instructor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instructor_profiles_user_id_key" ON "instructor_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "instructor_profiles" ADD CONSTRAINT "instructor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
