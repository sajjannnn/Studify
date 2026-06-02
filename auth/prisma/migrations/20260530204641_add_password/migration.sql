-- Add column as nullable first
ALTER TABLE "User" ADD COLUMN "password" TEXT;

-- Set a placeholder password for existing rows (will need to be reset)
UPDATE "User" SET "password" = '$2a$10$placeholder_force_reset' WHERE "password" IS NULL;

-- Make it required
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
