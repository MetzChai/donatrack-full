# How to Set FRONTEND_URL Environment Variable in Backend

This guide shows you how to set the `FRONTEND_URL` environment variable in your backend hosting platform. The steps vary depending on which platform you're using.

## Step 1: Find Your Vercel Frontend URL

First, get your Vercel frontend URL:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your frontend project
3. Your URL will be something like: `https://donatrack-full.vercel.app`
4. Copy this URL - you'll need it for the `FRONTEND_URL` value

---

## Step 2: Set FRONTEND_URL Based on Your Platform

### Option A: Vercel ⚡ (If Backend is Also on Vercel)

**If your backend is also deployed on Vercel:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Backend Project** (not the frontend one)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-frontend-project.vercel.app` (your frontend Vercel URL)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**
7. **Redeploy** your backend:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **Redeploy**

**Important Notes:**
- You need **TWO separate Vercel projects** (one for frontend, one for backend)
- Both projects can point to the same GitHub repo but different root directories
- Backend root: `backend/`
- Frontend root: `frontend/`
- See `VERCEL_MONOREPO_SETUP.md` for complete monorepo setup guide

**Visual Guide:**
```
Vercel Dashboard → Backend Project → Settings → Environment Variables → Add New
```

---

### Option B: Railway 🚂

**If your backend is hosted on Railway:**

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your backend project/service
3. Click on the **Variables** tab (or **Settings** → **Variables**)
4. Click **+ New Variable**
5. Add:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-app-name.vercel.app` (your Vercel URL)
6. Click **Add** or **Save**
7. Railway will automatically redeploy your service

**Visual Guide:**
```
Railway Dashboard → Your Project → Variables Tab → + New Variable
```

---

### Option C: Render 🎨

**If your backend is hosted on Render:**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service
3. Click on **Environment** in the left sidebar
4. Scroll down to **Environment Variables** section
5. Click **Add Environment Variable**
6. Add:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-app-name.vercel.app` (your Vercel URL)
7. Click **Save Changes**
8. Render will automatically redeploy your service

**Visual Guide:**
```
Render Dashboard → Your Service → Environment → Add Environment Variable
```

---

### Option D: Heroku 🟣

**If your backend is hosted on Heroku:**

**Using Heroku Dashboard:**
1. Go to [Heroku Dashboard](https://dashboard.heroku.com/)
2. Select your backend app
3. Go to **Settings** tab
4. Scroll to **Config Vars** section
5. Click **Reveal Config Vars**
6. Click **Add**
7. Add:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-app-name.vercel.app` (your Vercel URL)
8. Click **Add**
9. Your app will automatically restart

**Using Heroku CLI:**
```bash
heroku config:set FRONTEND_URL=https://your-app-name.vercel.app -a your-app-name
```

---

### Option E: DigitalOcean App Platform 🌊

**If your backend is hosted on DigitalOcean:**

1. Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com/)
2. Navigate to **Apps** → Select your backend app
3. Go to **Settings** tab
4. Scroll to **App-Level Environment Variables**
5. Click **Edit**
6. Click **Add Variable**
7. Add:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-app-name.vercel.app` (your Vercel URL)
8. Click **Save**
9. DigitalOcean will automatically redeploy

---

### Option F: AWS (Elastic Beanstalk / EC2) ☁️

**If your backend is on AWS:**

**Elastic Beanstalk:**
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **Elastic Beanstalk** → Your environment
3. Go to **Configuration** → **Software** → **Environment properties**
4. Click **Edit**
5. Click **Add environment property**
6. Add:
   - **Property name**: `FRONTEND_URL`
   - **Value**: `https://your-app-name.vercel.app`
7. Click **Apply**
8. Environment will update automatically

**EC2 / ECS:**
- Set environment variables in your task definition or launch configuration
- Or use AWS Systems Manager Parameter Store / Secrets Manager

---

### Option G: Google Cloud Platform (Cloud Run / App Engine) 🔵

**If your backend is on GCP:**

**Cloud Run:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Run** → Your service
3. Click **Edit & Deploy New Revision**
4. Go to **Variables & Secrets** tab
5. Click **Add Variable**
6. Add:
   - **Name**: `FRONTEND_URL`
   - **Value**: `https://your-app-name.vercel.app`
7. Click **Deploy**

**App Engine:**
- Add to `app.yaml`:
```yaml
env_variables:
  FRONTEND_URL: 'https://your-app-name.vercel.app'
```

---

### Option H: Azure (App Service) 🔷

**If your backend is on Azure:**

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **App Services** → Your app
3. Go to **Configuration** → **Application settings**
4. Click **+ New application setting**
5. Add:
   - **Name**: `FRONTEND_URL`
   - **Value**: `https://your-app-name.vercel.app`
6. Click **OK** → **Save**
7. App will restart automatically

---

### Option I: Fly.io 🪰

**If your backend is on Fly.io:**

**Using Fly.io Dashboard:**
1. Go to [Fly.io Dashboard](https://fly.io/dashboard)
2. Select your app
3. Go to **Secrets** tab
4. Click **Add Secret**
5. Add:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-app-name.vercel.app`
6. Click **Set Secret**
7. App will automatically redeploy

**Using Fly.io CLI:**
```bash
fly secrets set FRONTEND_URL=https://your-app-name.vercel.app -a your-app-name
```

---

### Option J: Self-Hosted / VPS / Docker 🐳

**If you're running the backend yourself:**

**Using `.env` file:**
1. SSH into your server or navigate to your project directory
2. Edit or create `.env` file:
```bash
nano .env
# or
vim .env
```

3. Add the line:
```
FRONTEND_URL=https://your-app-name.vercel.app
```

4. Save and restart your backend:
```bash
# If using PM2
pm2 restart your-app

# If using Docker
docker-compose restart

# If using systemd
sudo systemctl restart your-service
```

**Using Docker Compose:**
Add to your `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      - FRONTEND_URL=https://your-app-name.vercel.app
```

---

## Step 3: Verify It's Set Correctly

After setting the environment variable, verify it's working:

1. **Check backend logs** - Look for any CORS-related messages
2. **Test the backend** - Make a request from your frontend
3. **Check CORS headers** - In browser DevTools → Network tab, check response headers for CORS

You can also test by making a request from your frontend and checking the browser console for CORS errors.

---

## Quick Reference

| Platform | Where to Set | Auto-Redeploy? |
|----------|--------------|----------------|
| Vercel | Settings → Environment Variables | ✅ Yes (after redeploy) |
| Railway | Variables tab | ✅ Yes |
| Render | Environment → Environment Variables | ✅ Yes |
| Heroku | Settings → Config Vars | ✅ Yes |
| DigitalOcean | Settings → Environment Variables | ✅ Yes |
| AWS EB | Configuration → Environment Properties | ✅ Yes |
| GCP Cloud Run | Variables & Secrets | ✅ Yes |
| Azure | Configuration → Application Settings | ✅ Yes |
| Fly.io | Secrets tab | ✅ Yes |
| Self-hosted | `.env` file | ❌ Manual restart |

---

## Troubleshooting

### Issue: Environment variable not taking effect

**Solutions:**
- Make sure you **redeployed/restarted** your backend after setting the variable
- Check for typos in the variable name (must be exactly `FRONTEND_URL`)
- Verify the URL value doesn't have trailing slashes
- Check backend logs to see if the variable is being read

### Issue: Still getting CORS errors

**Solutions:**
- Verify `FRONTEND_URL` matches your exact Vercel URL (including `https://`)
- Check backend logs for CORS warnings
- Make sure you redeployed after setting the variable
- Try clearing browser cache

### Issue: Don't know which platform you're using

**Find out:**
1. Check your backend URL (e.g., `your-backend.railway.app` → Railway)
2. Check your email for deployment notifications
3. Check your Git repository for deployment configuration files
4. Ask your team/check documentation

---

## Need Help?

If you're still not sure which platform you're using or need help:
1. Check your backend URL - it usually contains the platform name
2. Check your deployment emails/notifications
3. Look at your Git repository for deployment configs
4. Check your hosting provider's dashboard

---

**Next Step:** After setting `FRONTEND_URL`, make sure to also set `NEXT_PUBLIC_API_URL` in Vercel (Step 1 from the main guide).

