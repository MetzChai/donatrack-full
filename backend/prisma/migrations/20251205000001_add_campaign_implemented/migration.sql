-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "isImplemented" BOOLEAN NOT NULL DEFAULT false;

