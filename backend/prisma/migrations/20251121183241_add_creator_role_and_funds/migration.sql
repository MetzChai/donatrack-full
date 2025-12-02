-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CREATOR';

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "paymentProvider" TEXT NOT NULL DEFAULT 'XENDIT',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "xenditPaymentId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentFunds" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "withdrawableFunds" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "xenditApiKey" TEXT,
ADD COLUMN     "xenditClientKey" TEXT,
ADD COLUMN     "xenditSecretKey" TEXT;
