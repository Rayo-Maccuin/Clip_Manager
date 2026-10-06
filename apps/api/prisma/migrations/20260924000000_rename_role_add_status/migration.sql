-- Create new enum type with ADMIN instead of STREAMER
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'MODERATOR');

-- Convert existing STREAMER values to ADMIN during type cast
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING 
  CASE "role"
    WHEN 'STREAMER' THEN 'ADMIN'
    ELSE "role"::text
  END::"UserRole_new";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MODERATOR';

-- Drop old enum type and rename new one
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

-- Add UserStatus enum and status column
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
