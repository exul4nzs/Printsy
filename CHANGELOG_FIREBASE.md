# Firebase Integration Changelog

Automated log for the Firebase Authentication integration (Next.js + Django).

---

## Step 1 — Safety check & initialization

**Status:** Blocked — working directory is not clean. Checkpoint commit was **not** created.

### Phase / step completed

- Git safety check performed before any Firebase code changes.
- This log file created with initialization notes.
- Dependency installation and implementation deferred until the tree is clean.

### Git status (2026-05-18)

Branch: `master` (ahead of `origin/master` by 9 commits)

**Modified (unstaged):**

| File |
|------|
| `backend/.env.example` |
| `backend/shop/models.py` |
| `backend/shop/templates/admin/shop/dashboard.html` |
| `backend/shop/templates/admin/shop/transaction_lobby.html` |

**Untracked:**

| File |
|------|
| `backend/shop/migrations/0006_add_order_number.py` |
| `frontend/.env.example` |

### Commands executed

```powershell
Set-Location "c:\Users\exul4nzs\Documents\University\Computer Engineering\Academics\Sophomore\Software Design\Projects\Printsy"
git status
```

### Checkpoint commit

**Not run.** Per integration plan: commit or stash existing work first, then run:

```powershell
git commit -am "chore: pre-firebase integration checkpoint"
```

### Revert plan (if needed later)

```powershell
git reset --hard HEAD
```

Use only after a successful checkpoint commit if integration needs a full rollback.

### Configuration review (`.env.example` — no secrets)

**Frontend** (`frontend/.env.example`) — already defines Firebase client keys and API base URL:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_API_URL`

**Backend** (`backend/.env.example`) — already defines:

- `FIREBASE_ACCOUNT_CREDENTIALS_PATH` (service account JSON for `firebase-admin`)
- `FRONTEND_URL` (CORS)
- Standard Django settings (`SECRET_KEY`, `DATABASE_URL`, etc.)

### Errors encountered

None. Integration blocked intentionally until the working tree is clean.

### Next action (awaiting approval)

1. You commit or stash the changes listed above.
2. Confirm when the tree is clean so we can create the checkpoint commit and proceed to **Step 2** (Phase 1 dependencies + Next.js Firebase client, auth context, token interception).
