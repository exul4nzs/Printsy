# Firebase Integration Changelog

Automated log for the Firebase Authentication integration (Next.js + Django).

**Auth providers:** Email/Password, Google (GitHub removed — not a dev tool).

---

## Step 1 — Safety check & initialization

**Status:** Complete

- Git checkpoint on branch `cursor/firebase-auth` (`de9fc70`).
- Env templates on `cursor/firebase-env-examples`.

---

## Step 2 — Next.js frontend

**Status:** Complete

### Files created

| File | Purpose |
|------|---------|
| `frontend/lib/firebase.ts` | Client SDK init (single app instance, browser-only) |
| `frontend/contexts/AuthContext.tsx` | Global auth state + email/Google methods |
| `frontend/components/providers/AppProviders.tsx` | Wraps app with `AuthProvider` |

### Files modified

| File | Change |
|------|--------|
| `frontend/lib/api.ts` | Bearer interceptor + `syncSessionFromFirebase()` |
| `frontend/lib/store.ts` | Exported `AuthUser` type |
| `frontend/components/auth/LoginModal.tsx` | Firebase email sign-in/up + Google popup |
| `frontend/components/Header.tsx` | Uses `useAuth()` |
| `frontend/app/layout.tsx` | `AppProviders` wrapper |
| `frontend/package.json` | `vitest`, `test` script |

### Commands

```powershell
cd frontend
npm install vitest --save-dev
npm test
```

### Errors

- LoginModal JSX typos during edit — fixed via string replace (`motionlessModal` → `motionlessModal`).

---

## Step 3 — Django backend

**Status:** Complete

### Files created

| File | Purpose |
|------|---------|
| `backend/shop/firebase_app.py` | Initialize `firebase-admin` from service account path |
| `backend/shop/firebase_auth.py` | Verify tokens, get/create `User`, serialize profile |
| `backend/shop/authentication.py` | DRF `FirebaseAuthentication` (Bearer) |

### Files modified

| File | Change |
|------|--------|
| `backend/printstudio/settings.py` | Register `FirebaseAuthentication` first |
| `backend/shop/views_auth.py` | Profile uses `serialize_user()` |
| `backend/requirements.txt` | `firebase-admin>=6.5.0` |
| `.gitignore` | Ignore `backend/secrets/` and service account JSON |

### Commands

```powershell
cd backend
.\venv\Scripts\pip install -r requirements.txt
```

---

## Step 4 — Tests

**Status:** Complete

| File | Result |
|------|--------|
| `frontend/lib/__tests__/api.auth.test.ts` | Pass — Bearer header attached |
| `backend/shop/test_firebase_auth.py` | Pass — `/api/auth/user/` blocks invalid/missing tokens |

### Commands

```powershell
cd frontend && npm test
cd backend && .\venv\Scripts\python.exe manage.py test shop.test_firebase_auth
```

---

## Local setup (required before trying sign-in)

### Frontend — `frontend/.env.local`

Copy from `.env.example` and paste your Firebase web config (from Console → Project settings → Your apps).

### Backend — `backend/.env`

```env
FIREBASE_ACCOUNT_CREDENTIALS_PATH=secrets/firebase-service-account.json
```

1. Firebase Console → Project settings → Service accounts → **Generate new private key**
2. Save JSON as `backend/secrets/firebase-service-account.json` (never commit)

### Run locally

```powershell
# Terminal 1
cd backend && .\venv\Scripts\python.exe manage.py runserver

# Terminal 2
cd frontend && npm run dev
```

### Firebase Console checklist

- [x] Email/Password enabled
- [x] Google enabled
- [ ] Authorized domains include `localhost` (and production URL when deployed)

---

## Revert plan

```powershell
git reset --hard HEAD  # only after a checkpoint commit on this branch
```
