# Vercel Monorepo Setup Guide - Frontend + Backend

Since you're deploying both frontend and backend on Vercel from the same GitHub repo, here's how to configure everything correctly.

## Understanding Your Setup

You have a monorepo structure:
```
DONATRACK/
├── frontend/     (Next.js app)
└── backend/      (Express.js API)
```

In Vercel, you'll need **TWO separate projects** (one for frontend, one for backend) pointing to the same GitHub repo but different root directories.

---

## Step 1: Set Up Two Vercel Projects

### Option A: If You Already Have Projects Set Up

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. You should see **two projects**:
   - One for frontend (e.g., `donatrack-frontend`)
   - One for backend (e.g., `donatrack-backend`)

### Option B: If You Need to Create Projects

**Create Frontend Project:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)
5. Click **Deploy**

**Create Backend Project:**
1. Click **Add New** → **Project** again
2. Import the **same** GitHub repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Start Command**: `npm start`
4. Click **Deploy**

---

## Step 2: Get Your Deployment URLs

After both projects are deployed, you'll have two URLs:

1. **Frontend URL**: `https://your-frontend-project.vercel.app`
   - Find it in: Frontend Project → Overview → Domains

2. **Backend URL**: `https://your-backend-project.vercel.app`
   - Find it in: Backend Project → Overview → Domains

**Important:** Write these down - you'll need them for environment variables!

---

## Step 3: Configure Frontend Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Frontend Project**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the following variables:

   **Variable 1:**
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-project.vercel.app` (your backend URL)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Variable 2 (if needed):**
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - **Environments**: ✅ Production only
   - Click **Save**

6. **Redeploy** the frontend:
   - Go to **Deployments** tab
   - Click **"..."** on the latest deployment
   - Click **Redeploy**

---

## Step 4: Configure Backend Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Backend Project**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the following variables:

   **Variable 1:**
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-frontend-project.vercel.app` (your frontend URL)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Variable 2 (Database URL - if using Prisma):**
   - **Key**: `DATABASE_URL`
   - **Value**: Your database connection string
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Variable 3 (JWT Secret - if using):**
   - **Key**: `JWT_SECRET`
   - **Value**: Your JWT secret (use a strong random string)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Variable 4 (Other backend variables):**
   - Add any other environment variables your backend needs
   - Check your `backend/src/config/index.ts` for required variables

6. **Redeploy** the backend:
   - Go to **Deployments** tab
   - Click **"..."** on the latest deployment
   - Click **Redeploy**

---

## Step 5: Configure Backend Build Settings (Important!)

Since your backend is an Express.js app, you need to configure Vercel to run it as a serverless function.

### Create `vercel.json` in Backend Root

Create a file `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**OR** use Vercel's Serverless Functions approach:

Create `backend/api/index.js`:

```javascript
const app = require('../dist/server.js').default || require('../dist/server.js');
module.exports = app;
```

Then update `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

### Alternative: Use Vercel's Node.js Runtime

If the above doesn't work, you might need to:

1. In Backend Project Settings → **General**
2. Set **Node.js Version**: 18.x or 20.x
3. In **Build & Development Settings**:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Output Directory**: `backend/dist`
   - **Install Command**: `cd backend && npm install`

---

## Step 6: Verify Everything Works

### Test Backend:
```bash
curl https://your-backend-project.vercel.app/api/test
# Should return: {"message":"API routes are working",...}
```

### Test Frontend:
1. Visit `https://your-frontend-project.vercel.app`
2. Open browser DevTools (F12)
3. Check **Console** tab - should NOT see:
   - `❌ NEXT_PUBLIC_API_URL is not set!`
4. Check **Network** tab:
   - API requests should go to your backend URL
   - Status should be 200 (not 404)

---

## Common Issues & Solutions

### Issue: Backend returns 404 or doesn't work

**Solution:**
- Vercel is designed for serverless functions, not long-running Node.js servers
- Your Express app needs to be configured as a serverless function
- Consider using Vercel's Serverless Functions or deploy backend elsewhere (Railway, Render)

**Alternative:** Use Vercel's API Routes feature by creating API endpoints in your backend that work with serverless functions.

### Issue: Environment variables not working

**Solution:**
- Make sure you **redeployed** after adding environment variables
- Check that variables are set for the correct environment (Production/Preview/Development)
- Verify variable names match exactly (case-sensitive)

### Issue: CORS errors

**Solution:**
- Verify `FRONTEND_URL` is set correctly in backend
- Check that the URL matches exactly (including `https://`)
- The backend CORS config should automatically allow Vercel origins

### Issue: Database connection fails

**Solution:**
- Make sure `DATABASE_URL` is set in backend environment variables
- Verify database allows connections from Vercel's IP ranges
- Check Prisma migrations are run (you may need to run them manually or in build step)

---

## Recommended: Deploy Backend Elsewhere

**Important Note:** Vercel is optimized for frontend/static sites and serverless functions. For a traditional Express.js backend, consider:

- **Railway** (recommended) - Easy Node.js deployment
- **Render** - Good free tier
- **Fly.io** - Fast global deployment
- **DigitalOcean App Platform** - Simple deployment

If you deploy backend elsewhere:
1. Set `NEXT_PUBLIC_API_URL` in frontend to point to the external backend
2. Set `FRONTEND_URL` in the external backend to point to your Vercel frontend

---

## Quick Checklist

- [ ] Two Vercel projects created (frontend + backend)
- [ ] Frontend project root directory: `frontend`
- [ ] Backend project root directory: `backend`
- [ ] `NEXT_PUBLIC_API_URL` set in frontend project (points to backend URL)
- [ ] `FRONTEND_URL` set in backend project (points to frontend URL)
- [ ] All other backend env vars set (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Both projects redeployed after setting environment variables
- [ ] Backend accessible at its URL
- [ ] Frontend can make API calls to backend

---

## Need Help?

If you're having issues:
1. Check Vercel deployment logs for both projects
2. Verify environment variables are set correctly
3. Test backend URL directly with curl
4. Check browser console for specific error messages

**Pro Tip:** Consider deploying your backend to Railway or Render for better compatibility with Express.js, then just point your Vercel frontend to that backend URL.

