# Vercel NOT_FOUND Error - Complete Guide

## 1. The Fix ✅

The code has been updated to properly handle API requests in production. Here's what changed:

### Changes Made:

1. **`frontend/lib/api.ts`**: Enhanced base URL resolution with better error handling
2. **Added interceptors**: Better debugging and error messages for 404/NOT_FOUND errors

### What You Need to Do:

**Set the `NEXT_PUBLIC_API_URL` environment variable in Vercel:**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend API URL (e.g., `https://your-backend.railway.app` or `https://api.yourdomain.com`)
   - **Environment**: Production, Preview, and Development (or as needed)
4. **Redeploy** your application

---

## 2. Root Cause Analysis 🔍

### What Was Happening:

**The Problem:**
- Your frontend makes API calls to endpoints like `/proofs`, `/campaigns`, `/admin/users`, etc.
- These calls use axios with a `baseURL` configuration
- In production on Vercel, if `NEXT_PUBLIC_API_URL` wasn't set, the code defaulted to `http://localhost:4000`
- Browser tried to make requests to `http://localhost:4000/proofs` from the Vercel-hosted site
- This failed because:
  - `localhost:4000` doesn't exist from the user's browser (it's your local machine)
  - OR if the baseURL was empty/relative, Vercel's Next.js server tried to handle `/proofs` as a Next.js route
  - Next.js couldn't find a route handler for `/proofs` → **NOT_FOUND error**

**What the Code Was Actually Doing:**
```typescript
// Before fix:
baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
// If NEXT_PUBLIC_API_URL not set → uses localhost (wrong in production!)
```

**What It Needed to Do:**
```typescript
// After fix:
// 1. Check for NEXT_PUBLIC_API_URL (required in production)
// 2. Provide clear error messages if missing
// 3. Only use localhost in development
```

### Conditions That Triggered This:

1. **Missing Environment Variable**: `NEXT_PUBLIC_API_URL` not set in Vercel
2. **Production Deployment**: Code running on Vercel (not localhost)
3. **Client-Side API Calls**: Any page making API requests (admin page, campaigns, etc.)
4. **Build-Time vs Runtime**: Environment variables must be available at build AND runtime

### The Misconception:

**Common mistake**: Assuming that environment variables work the same way in production as in development. In Next.js:
- `NEXT_PUBLIC_*` variables are embedded at **build time**
- They must be set in Vercel **before** deployment
- They're not automatically available just because they exist locally

---

## 3. Understanding the Concept 🎓

### Why This Error Exists:

**Vercel's NOT_FOUND error protects you from:**
1. **Broken API connections**: Prevents silent failures when backend is unreachable
2. **Misconfigured deployments**: Forces you to properly configure environment variables
3. **Security**: Prevents accidentally exposing localhost URLs in production

### The Mental Model:

Think of your application architecture like this:

```
┌─────────────────┐         HTTP Requests         ┌─────────────────┐
│                 │ ────────────────────────────> │                 │
│  Frontend       │                                │  Backend API    │
│  (Vercel)       │ <────────────────────────────  │  (Railway/etc)  │
│                 │         JSON Responses          │                 │
└─────────────────┘                                └─────────────────┘
     Next.js                                           Express.js
```

**Key Points:**
1. **Frontend and Backend are separate**: They can be deployed on different platforms
2. **Environment Variables bridge them**: `NEXT_PUBLIC_API_URL` tells frontend where backend is
3. **Build-time embedding**: Next.js bakes `NEXT_PUBLIC_*` vars into the JavaScript bundle
4. **Runtime resolution**: Browser reads the embedded URL and makes requests

### How This Fits into Next.js/Vercel:

**Next.js Environment Variables:**
- `NEXT_PUBLIC_*`: Exposed to browser (embedded at build time)
- Regular vars: Only available server-side (API routes, SSR)

**Vercel Deployment Flow:**
1. Code pushed to Git
2. Vercel builds your Next.js app
3. Environment variables are injected during build
4. Built app is deployed
5. Browser loads JavaScript with embedded API URL

**The Problem:**
- If `NEXT_PUBLIC_API_URL` isn't set → defaults to localhost
- Browser tries to call localhost → fails
- OR if baseURL is relative → Next.js tries to handle as route → NOT_FOUND

---

## 4. Warning Signs to Watch For 🚨

### Red Flags That Indicate This Issue:

1. **Environment Variable Not Set:**
   ```bash
   # Check in Vercel dashboard
   # Settings → Environment Variables
   # Look for NEXT_PUBLIC_API_URL
   ```

2. **Console Errors:**
   ```
   ❌ NOT_FOUND Error: GET /proofs
   Network Error: Could not reach backend API
   ```

3. **404 Errors in Network Tab:**
   - Open browser DevTools → Network tab
   - Look for failed requests to `/proofs`, `/campaigns`, etc.
   - Status: 404 (NOT_FOUND)

4. **Works Locally But Not in Production:**
   - App works fine on `localhost:3000`
   - Same code fails on Vercel
   - Classic sign of missing environment variable

### Code Smells to Avoid:

1. **Hardcoded URLs:**
   ```typescript
   // ❌ BAD
   baseURL: "http://localhost:4000"
   
   // ✅ GOOD
   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
   ```

2. **No Environment Check:**
   ```typescript
   // ❌ BAD - No validation
   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
   
   // ✅ GOOD - Validates in production
   if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
     throw new Error('NEXT_PUBLIC_API_URL must be set in production');
   }
   ```

3. **Silent Failures:**
   ```typescript
   // ❌ BAD - No error handling
   const res = await API.get("/proofs");
   
   // ✅ GOOD - Proper error handling
   try {
     const res = await API.get("/proofs");
   } catch (error) {
     console.error("Failed to fetch proofs:", error);
     // Show user-friendly error message
   }
   ```

### Similar Mistakes to Avoid:

1. **API Route Mismatch:**
   - Frontend calls `/api/proofs`
   - Backend expects `/proofs`
   - Always verify route paths match

2. **CORS Issues:**
   - Backend not configured to accept requests from Vercel domain
   - Check backend CORS settings include your Vercel URL

3. **Missing Trailing Slash:**
   ```typescript
   // Can cause issues
   baseURL: "https://api.example.com/"  // trailing slash
   url: "/proofs"  // leading slash
   // Results in: https://api.example.com//proofs (double slash)
   ```

---

## 5. Alternative Approaches & Trade-offs 🔄

### Approach 1: Direct Backend URL (Current Solution) ✅

**How it works:**
- Set `NEXT_PUBLIC_API_URL` to your backend URL
- Frontend makes direct requests to backend

**Pros:**
- Simple and straightforward
- No additional server load
- Direct connection

**Cons:**
- Requires CORS configuration on backend
- Backend URL exposed in client-side code
- Backend must be publicly accessible

**Best for:** Most applications, especially when backend is on a separate service

---

### Approach 2: Next.js API Routes as Proxies

**How it works:**
- Create `/app/api/proofs/route.ts` that forwards requests to backend
- Frontend calls `/api/proofs` (relative URL)
- Next.js server proxies to backend

**Example:**
```typescript
// app/api/proofs/route.ts
export async function GET() {
  const backendUrl = process.env.BACKEND_URL; // Server-side only
  const res = await fetch(`${backendUrl}/proofs`);
  return Response.json(await res.json());
}
```

**Pros:**
- Backend URL hidden from client
- No CORS needed (server-to-server)
- Can add caching, rate limiting

**Cons:**
- More code to maintain
- Additional server load on Vercel
- Slightly more latency (extra hop)

**Best for:** When you want to hide backend URL or add middleware logic

---

### Approach 3: Next.js Rewrites (Server-Side Only)

**How it works:**
- Configure `next.config.js` rewrites
- Only works for server-side requests (SSR, API routes)

**Pros:**
- Clean URLs
- No client-side configuration needed

**Cons:**
- **Doesn't work for client-side axios calls** (your use case)
- Only for server-side rendering

**Best for:** SSR applications, not client-side API calls

---

### Approach 4: Environment-Specific Configuration

**How it works:**
- Different configs for dev/staging/production
- Use different backend URLs per environment

**Example:**
```typescript
const config = {
  development: 'http://localhost:4000',
  staging: 'https://staging-api.example.com',
  production: 'https://api.example.com'
};
```

**Pros:**
- Clear separation of environments
- Easy to test different backends

**Cons:**
- More configuration to manage
- Still need environment variables

**Best for:** Complex multi-environment setups

---

## Summary Checklist ✅

To prevent this error in the future:

- [ ] Always set `NEXT_PUBLIC_API_URL` in Vercel before deploying
- [ ] Verify environment variables are set for all environments (Production, Preview, Development)
- [ ] Test API calls in production after deployment
- [ ] Check browser console for API errors
- [ ] Verify backend CORS allows your Vercel domain
- [ ] Use relative URLs only when using Next.js API route proxies
- [ ] Never hardcode localhost URLs in production code
- [ ] Add error handling for API failures
- [ ] Log API base URL in development for debugging

---

## Quick Debugging Steps 🐛

If you still see NOT_FOUND errors:

1. **Check Environment Variable:**
   ```bash
   # In Vercel dashboard
   Settings → Environment Variables
   Verify NEXT_PUBLIC_API_URL is set
   ```

2. **Check Browser Console:**
   ```javascript
   // Open DevTools → Console
   // Look for error messages about API URL
   ```

3. **Check Network Tab:**
   ```
   DevTools → Network → Look for failed requests
   Check the Request URL - is it pointing to the right backend?
   ```

4. **Verify Backend is Running:**
   ```bash
   # Test backend directly
   curl https://your-backend-url.com/proofs
   ```

5. **Check CORS Settings:**
   ```typescript
   // In backend/src/app.ts
   app.use(cors({
     origin: ['https://your-vercel-app.vercel.app', 'http://localhost:3000']
   }));
   ```

---

## Need More Help?

- Check Vercel docs: https://vercel.com/docs/environment-variables
- Next.js env vars: https://nextjs.org/docs/basic-features/environment-variables
- Vercel NOT_FOUND docs: https://vercel.com/docs/errors/NOT_FOUND

