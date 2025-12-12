# Database Migration Instructions

The migration needs to be applied to update the Proof table to support multiple images.

## Option 1: Using Prisma Migrate (Recommended)

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Or for development:
```bash
cd backend
npx prisma migrate dev
```

## Option 2: Using Prisma DB Push (Fast, for development only)

```bash
cd backend
npx prisma db push
npx prisma generate
```

## Option 3: Manual SQL Execution

If you have direct database access, you can run the migration SQL manually:

1. Connect to your PostgreSQL database
2. Run the SQL from: `backend/prisma/migrations/20251206000000_change_proof_imageurl_to_array/migration.sql`

After applying the migration, restart your backend server.

