# Debugging: Why No Proofs Are Showing

## Step 1: Check if Proofs Exist in Database

Open your browser and go to:
```
http://localhost:4000/proofs/debug
```

This will show:
- How many proofs exist in the database
- A sample proof (if any exist)
- Any database errors

## Step 2: Check Browser Console

1. Open the Transparency page or Admin dashboard
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Look for logs like:
   - "Fetching proofs from: ..."
   - "✓ Proofs API response received"
   - "Proofs fetched: X items"

## Step 3: Check Backend Console

Look for logs like:
- "=== getAllProofs called ==="
- "Proof table exists. Total proofs in database: X"
- "✓ Fetched X proofs using Prisma query"
- Or error messages

## Step 4: Create a Test Proof

1. Go to Admin Dashboard
2. Click "+ Add Proof"
3. Fill in:
   - Title: "Test Proof"
   - Description: "Testing proof creation"
   - Campaign: Select any campaign
   - Image URLs: Add at least one image URL (e.g., "https://via.placeholder.com/400x300")
4. Click Save
5. Check the browser console for "Proof created:" message
6. Check backend console for "Proof created successfully:" message

## Step 5: Verify API Endpoint

Test the API directly:
```
http://localhost:4000/proofs
```

You should see a JSON array. If empty: `[]`, if there are proofs, you'll see the data.

## Common Issues

### Issue 1: No Proofs Created Yet
**Solution**: Create a proof from the admin dashboard first.

### Issue 2: Database Migration Not Applied
**Solution**: Run:
```bash
cd backend
npx prisma db push
npx prisma generate
```
Then restart the backend server.

### Issue 3: API Connection Error
**Solution**: 
- Check if backend is running on port 4000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env` file
- Verify CORS is enabled in backend

### Issue 4: Authentication Issue
**Solution**: 
- Make sure you're logged in as ADMIN
- Check if token is valid in localStorage

## Quick Test

Run this in browser console on the admin page:
```javascript
fetch('http://localhost:4000/proofs')
  .then(r => r.json())
  .then(data => console.log('Proofs:', data))
  .catch(err => console.error('Error:', err));
```

This will show you exactly what the API is returning.

