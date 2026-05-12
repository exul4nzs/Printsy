# Printsy Deployment Guide

## Overview
Printsy consists of two parts:
1. **Frontend (Next.js)** → Deploy to **Vercel**
2. **Backend (Django)** → Deploy to **Render** or **Railway**

---

## Step 1: Deploy Backend to Render (Free)

### 1.1 Prepare Backend for Production

Create `backend/render.yaml`:

```yaml
services:
  - type: web
    name: printsy-backend
    runtime: python
    buildCommand: |
      pip install -r requirements.txt
      python manage.py collectstatic --noinput
      python manage.py migrate
    startCommand: gunicorn printstudio.wsgi:application
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: false
      - key: ALLOWED_HOSTS
        value: "your-backend-url.onrender.com,localhost"
      - key: DATABASE_URL
        fromDatabase:
          name: printsy-db
          property: connectionString
      - key: TELEGRAM_BOT_TOKEN
        sync: false
      - key: TELEGRAM_ADMIN_CHAT_ID
        sync: false
      - key: TELEGRAM_NOTIFICATIONS_ENABLED
        value: true
      - key: CORS_ALLOWED_ORIGINS
        value: "https://your-frontend.vercel.app"

    disk:
      name: media
      mountPath: /opt/render/project/src/media
      sizeGB: 1

databases:
  - name: printsy-db
    databaseName: printsy
    user: printsy
```

### 1.2 Update Backend Settings

In `backend/printstudio/settings.py`, add production settings:

```python
# Add these at the end of settings.py

# Production settings
if not DEBUG:
    # Security
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    
    # CORS - Replace with your Vercel URL after deployment
    CORS_ALLOWED_ORIGINS = [
        "https://your-frontend.vercel.app",
        "https://printsyy.vercel.app",  # Update this!
    ]
    
    # Static files
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 1.3 Add Production Dependencies

In `backend/requirements.txt`, add:

```
gunicorn>=21.0.0
whitenoise>=6.5.0
psycopg2-binary>=2.9.7
dj-database-url>=2.0.0
```

### 1.4 Deploy to Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Blueprint"**
3. Select your Printsy repository
4. Render will detect `render.yaml` and configure everything
5. Click **"Apply"**
6. Wait for deployment (5-10 minutes)
7. Copy your backend URL: `https://printsy-backend-xxxxx.onrender.com`

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Frontend

Update `frontend/.env.local`:

```env
# Production API URL (your Render backend URL)
NEXT_PUBLIC_API_URL=https://printsy-backend-xxxxx.onrender.com

# Local development (keep for local testing)
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2.2 Deploy to Vercel

**Option A: Vercel CLI (Recommended)**

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? [Y/n] → Y
# - Which scope? → your-username
# - Link to existing project? [y/N] → N
# - What's your project name? → printsyy
```

**Option B: GitHub Integration**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your Printsy repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Add Environment Variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-render-backend-url.onrender.com`
6. Click **"Deploy"**

---

## Step 3: Connect Frontend + Backend

### 3.1 Get Your URLs

After deployment:
- **Frontend:** `https://printsyy.vercel.app` (example)
- **Backend:** `https://printsy-backend-xxxxx.onrender.com` (example)

### 3.2 Update CORS in Backend

1. Go to Render Dashboard → your backend service
2. Go to **Environment** tab
3. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://printsyy.vercel.app
   ```
4. The backend will restart automatically

### 3.3 Update Frontend Environment

1. Go to Vercel Dashboard → your project
2. Go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to your Render backend URL
4. Redeploy: Go to **Deployments** → click **Redeploy**

---

## Step 4: Test Your Deployment

### 4.1 Verify Backend
- Open: `https://your-backend.onrender.com/admin/`
- Login with admin/printsy123
- Check if dashboard loads

### 4.2 Verify Frontend
- Open: `https://your-frontend.vercel.app/`
- Check if products load
- Test photo upload → cart → checkout flow

### 4.3 Test End-to-End
1. Place an order on the frontend
2. Check Telegram for notification
3. Check admin panel for the order
4. Update order status in admin
5. Verify Telegram gets status update

---

## Troubleshooting

### Frontend Shows "Failed to load products"
**Cause:** CORS not configured or backend URL wrong
**Fix:** 
- Check `NEXT_PUBLIC_API_URL` in Vercel env vars
- Add frontend URL to `CORS_ALLOWED_ORIGINS` in Render

### Backend Admin CSS Missing
**Cause:** Static files not collected
**Fix:**
```bash
# In Render shell or locally
cd backend
python manage.py collectstatic --noinput
```

### Telegram Not Working
**Cause:** Environment variables not set
**Fix:**
- Check `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` in Render env vars
- Test with: `python manage.py test_telegram`

### Images Not Loading
**Cause:** Media files not persisting
**Fix:** 
- Check Render disk is mounted at `/opt/render/project/src/media`
- Or use AWS S3 for production media storage

---

## Free Tier Limits

| Platform | Free Tier | Limitations |
|----------|-----------|-------------|
| **Vercel** | Hobby | 100GB bandwidth, 10s serverless timeout |
| **Render** | Free Web Service | Spins down after 15 min idle, 512MB RAM |
| **Render PostgreSQL** | Free | 90-day expiry, 1GB storage |

---

## Quick Commands

```bash
# Push all changes before deploying
git add -A
git commit -m "chore: Prepare for deployment"
git push origin master

# Deploy frontend updates
vercel --prod

# Deploy backend updates (push to GitHub, Render auto-deploys)
git push origin master
```

---

## Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Products display correctly
- [ ] Photo upload works
- [ ] Cart persists items
- [ ] Checkout flow complete
- [ ] Telegram notifications sent
- [ ] Admin panel accessible
- [ ] Order status updates work
- [ ] CSV export works

**You're live! 🚀**
