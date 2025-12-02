-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "resetPasswordExpiry" TIMESTAMP(3);

