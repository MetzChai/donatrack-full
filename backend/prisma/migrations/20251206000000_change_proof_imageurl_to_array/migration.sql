-- AlterTable
-- Add new imageUrls column as TEXT array (nullable first)
ALTER TABLE "Proof" ADD COLUMN "imageUrls" TEXT[];

-- Migrate existing data from imageUrl to imageUrls
-- Convert single imageUrl value to an array with one element
UPDATE "Proof" SET "imageUrls" = ARRAY["imageUrl"] WHERE "imageUrl" IS NOT NULL AND "imageUrl" != '';

-- Set empty array for any rows that still have NULL (shouldn't happen, but safety check)
UPDATE "Proof" SET "imageUrls" = ARRAY[]::TEXT[] WHERE "imageUrls" IS NULL;

-- Make imageUrls NOT NULL (after migration)
ALTER TABLE "Proof" ALTER COLUMN "imageUrls" SET NOT NULL;

-- Drop the old imageUrl column
ALTER TABLE "Proof" DROP COLUMN "imageUrl";

