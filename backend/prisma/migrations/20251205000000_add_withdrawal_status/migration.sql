-- CreateTable (if Withdrawal table doesn't exist)
CREATE TABLE IF NOT EXISTS "Withdrawal" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Withdrawal_userId_fkey'
    ) THEN
        ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Withdrawal_campaignId_fkey'
    ) THEN
        ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_campaignId_fkey" 
        FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add status column if table exists but column doesn't
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Withdrawal') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Withdrawal' AND column_name = 'status') THEN
            ALTER TABLE "Withdrawal" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING';
        END IF;
    END IF;
END $$;

