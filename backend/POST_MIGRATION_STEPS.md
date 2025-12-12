# Post-Migration Steps

After `prisma db push` completes successfully:

## 1. Regenerate Prisma Client
```bash
npx prisma generate
```

This ensures the Prisma client matches your updated schema.

## 2. Restart Backend Server
Stop your backend server (Ctrl+C) and restart it:
```bash
npm run dev
```

## 3. Verify the Migration
The Proof table should now have:
- ✅ `imageUrls` column (TEXT[] array) - NEW
- ❌ `imageUrl` column - REMOVED (if migration applied correctly)

## 4. Test Proof Creation
Try creating a proof with multiple images from the admin dashboard. It should now:
- Store all image URLs in the `imageUrls` array
- Display all images correctly
- Work without errors

## Troubleshooting

If you see errors:
1. Check backend console logs for specific error messages
2. Verify the database connection is working
3. Ensure all migrations are applied: `npx prisma migrate status`
4. If needed, manually check the database schema

