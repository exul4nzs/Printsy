# 🚀 Printsy Production Deployment Guide

This guide provides a comprehensive, step-by-step walkthrough for deploying **Printsy** to production using:
* **Supabase** (for the PostgreSQL database)
* **Render** (for the Django backend API)
* **Vercel** (for the Next.js frontend)

---

## 🗺️ Architectural Overview

```mermaid
graph TD
    Vercel[Vercel: Next.js Frontend] -->|API Requests| Render[Render: Django Backend]
    Render -->|Queries & Migrations| Supabase[(Supabase: PostgreSQL DB)]
    Render -->|Admin Verification| Firebase[Firebase Auth Server]
    Vercel -->|Client Authentication| Firebase
```

---

## 📦 Phase 1: Supabase Setup (PostgreSQL Database)

We use Supabase for the PostgreSQL database because it is incredibly fast, offers a generous free tier, and does not automatically delete your database after 90 days like Render's free database.

1. Go to [Supabase](https://supabase.com/) and sign in or sign up.
2. Click **New Project** and select your organization.
3. Fill in the project details:
   * **Name:** `Printsy DB`
   * **Database Password:** *Generate a secure password and save it somewhere safe!*
   * **Region:** Choose the region closest to your users (e.g., Singapore for Southeast Asia).
4. Click **Create new project** and wait 2 minutes for it to provision.
5. Once ready, navigate to the **Project Settings** (gear icon in the sidebar) ➡️ **Database**.
6. Scroll down to **Connection strings**, select **URI**, and copy the connection string.
   * *Example string:* `postgresql://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=disable`
   * **CRITICAL:** Replace `[YOUR-PASSWORD]` with the database password you generated.
   * **TIP:** Change the port from `6543` to `5432` and remove `?sslmode=disable` for direct, stable Django connections:
     `postgresql://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`

---

## 🐍 Phase 2: Render Setup (Django Backend)

We deploy the Django backend to Render as a Python Web Service.

### 1. Preparing the Code
Make sure you have pushed all your latest code to GitHub, including the root-level `render.yaml` file.

### 2. Creating the Service on Render
1. Sign in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** ➡️ **Blueprint**.
3. Connect your GitHub repository.
4. Render will auto-discover the `render.yaml` at the root and pre-fill the configuration.
5. In the blueprint creation screen, look at the database configuration. **Since we are using Supabase instead, we can bypass the Render database to save your Render free-tier credits!**
   * *Instead of Blueprint, we recommend creating a manual Web Service for maximum control when using external databases.*
   * **To do it manually:**
     1. Click **New +** ➡️ **Web Service**.
     2. Connect your GitHub repository.
     3. Configure the following basic details:
        * **Name:** `printsy-backend`
        * **Runtime:** `Python3`
        * **Root Directory:** `backend`
        * **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
        * **Start Command:** `gunicorn printstudio.wsgi:application --bind 0.0.0.0:$PORT`
        * **Plan:** `Free`

### 3. Adding Secret Files (For Firebase Credentials)
Since Firebase requires the `firebase-service-account.json` to verify tokens, and we should **never** commit this file to Git, Render provides a secure feature called "Secret Files":
1. In your Render Web Service settings, click on the **Environment** tab on the left.
2. Scroll down to **Secret Files** and click **Add Secret File**.
3. Set the **Filename** to:
   `secrets/firebase-service-account.json`
4. In the contents field, paste the **entire JSON contents** of your Firebase service account private key.
5. Click **Save**.

### 4. Adding Environment Variables on Render
Under the same **Environment** tab, add the following key-value variables:

| Key | Value | Notes |
|---|---|---|
| `PYTHON_VERSION` | `3.11.0` | Match local development |
| `DEBUG` | `False` | Disables debug mode in production |
| `SECRET_KEY` | *[Generate a random 50-character string]* | Production Django key |
| `DATABASE_URL` | *[Your Supabase Connection String]* | e.g. `postgresql://...:5432/postgres` |
| `ALLOWED_HOSTS` | `printsy-backend.onrender.com` | Replace with your actual Render URL |
| `FRONTEND_URL` | *[Your Vercel Frontend URL]* | e.g. `https://printsy.vercel.app` |
| `FIREBASE_ACCOUNT_CREDENTIALS_PATH` | `secrets/firebase-service-account.json` | Path of your secret file |
| `TELEGRAM_BOT_TOKEN` | *[Your Telegram Bot Token]* | From @BotFather |
| `TELEGRAM_ADMIN_CHAT_ID` | *[Your Telegram Admin Chat ID]* | From @userinfobot |
| `TELEGRAM_NOTIFICATIONS_ENABLED` | `True` | Send order notifications to Telegram |
| `GCASH_NUMBER` | `09559054871` | For order checkout screen |
| `GCASH_NAME` | `B*** T****` | GCash name displayed |

6. Click **Save Changes**. Render will automatically trigger a build, run your migrations on Supabase, collect static files, and start your server!

---

## ⚡ Phase 3: Vercel Setup (Next.js Frontend)

Vercel is the optimal hosting platform for Next.js applications, offering instant deployments and global CDN delivery.

1. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2. Click **Add New...** ➡️ **Project**.
3. Import your **Printsy** Git repository.
4. Configure the Project Settings:
   * **Project Name:** `printsy-frontend` (or just `printsy`)
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Edit this and select **`frontend`**. (This tells Vercel to only build the Next.js app).
5. Open the **Environment Variables** accordion and add the following keys:

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://printsy-backend.onrender.com/api` | Point to your Render URL (must end with `/api`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | *[Your Firebase API Key]* | From Firebase Console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `printsy-13528.firebaseapp.com` | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `printsy-13528` | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `printsy-13528.firebasestorage.app` | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| `177550352295` | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:177550352295:web:488d22c4d90ecd8ad86082` | |
| `NEXT_PUBLIC_GCASH_NUMBER` | `09559054871` | |
| `NEXT_PUBLIC_GCASH_NAME` | `B*** T****` | |
| `NEXT_PUBLIC_TELEGRAM_USERNAME` | `PRINTSY_EXUL_BOT` | |

6. Click **Deploy**. Vercel will build your Next.js application and provide you with a production-ready domain (e.g. `https://printsy-frontend.vercel.app`).

---

## 🔒 Phase 4: Post-Deployment Config (CORS & Firebase)

Once Vercel and Render are successfully deployed, you need to update two settings to allow secure communications:

### 1. Enable Vercel Domain on Firebase Auth
1. Go to your **Firebase Console** ➡️ **Project settings** ➡️ **Authorized domains**.
2. Click **Add domain** and paste your Vercel deployment URL (e.g., `printsy-frontend.vercel.app`).
   * *This permits your production users to securely sign in via Google Popup.*

### 2. Update CORS Settings on Render
1. Copy your Vercel domain.
2. Go to your Render Backend Service Settings ➡️ **Environment**.
3. Update `FRONTEND_URL` to your production Vercel domain.
4. Save and trigger a redeploy of your backend.

---

## 🎉 Congratulations!
Your full-stack production application is now completely deployed! 
* Your **frontend** is blazingly fast on **Vercel**'s edge network.
* Your **backend** is running securely on **Render**.
* Your **data** is persisted reliably on **Supabase**.
